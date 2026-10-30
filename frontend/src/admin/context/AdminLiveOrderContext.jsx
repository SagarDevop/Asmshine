import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getApiBase } from '../services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { playOrderNotificationSound } from '../utils/audioAlert';

const AdminLiveOrderContext = createContext(null);

export const AdminLiveOrderProvider = ({ children }) => {
  const { token, isAuthenticated } = useAdminAuth();

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('asm_admin_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const subscribersRef = useRef(new Set());
  const eventSourceRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Toggle chime sound
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('asm_admin_sound', next ? 'true' : 'false');
      } catch {}
      if (next) {
        // Play quick sample chime so user knows sound works
        playOrderNotificationSound();
      }
      return next;
    });
  };

  // Dismiss toast banner
  const dismissAlert = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setLatestAlert(null);
  };

  // Mark all unread notifications as read
  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  // Subscribe callback for pages (AdminOrdersPage, AdminDashboardPage)
  const subscribeOrderEvent = useCallback((callback) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Dispatch event to local subscribers and broadcast channel
  const dispatchOrderEvent = useCallback((eventType, data) => {
    subscribersRef.current.forEach((cb) => {
      try {
        cb(eventType, data);
      } catch (err) {
        console.error('[AdminLiveContext] Subscriber callback error:', err);
      }
    });
  }, []);

  // Handle incoming new order
  const handleNewOrderReceived = useCallback((order, fromBroadcast = false) => {
    console.log('[AdminLiveContext] 🔔 New Order Event Received:', order.orderId);

    // Update state
    setIncomingOrders((prev) => [order, ...prev.slice(0, 19)]);
    setUnreadCount((prev) => prev + 1);
    setLatestAlert(order);

    // Play chime if sound enabled
    if (soundEnabled) {
      playOrderNotificationSound();
    }

    // Auto dismiss toast after 8 seconds
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setLatestAlert(null);
    }, 8000);

    // Notify registered pages
    dispatchOrderEvent('NEW_ORDER', order);

    // Broadcast to other open admin tabs if this originated from SSE
    if (!fromBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'NEW_ORDER', order });
      } catch (err) {
        console.warn('[AdminLiveContext] Broadcast post error:', err.message);
      }
    }
  }, [soundEnabled, dispatchOrderEvent]);

  // Handle order status change
  const handleStatusChanged = useCallback((payload, fromBroadcast = false) => {
    dispatchOrderEvent('ORDER_STATUS_CHANGED', payload);

    if (!fromBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'ORDER_STATUS_CHANGED', payload });
      } catch (err) {
        console.warn('[AdminLiveContext] Broadcast post error:', err.message);
      }
    }
  }, [dispatchOrderEvent]);

  // Set up BroadcastChannel for cross-tab communication
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    try {
      const channel = new BroadcastChannel('asm_admin_live_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'NEW_ORDER' && msg.order) {
          handleNewOrderReceived(msg.order, true);
        } else if (msg.type === 'ORDER_STATUS_CHANGED' && msg.payload) {
          handleStatusChanged(msg.payload, true);
        }
      };
    } catch (err) {
      console.warn('[AdminLiveContext] BroadcastChannel init error:', err.message);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, [handleNewOrderReceived, handleStatusChanged]);

  // Establish SSE connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLiveConnected(false);
      return;
    }

    let isSubscribed = true;

    const connectSSE = () => {
      if (!isSubscribed) return;

      const apiBase = getApiBase();
      const sseUrl = `${apiBase}/api/v1/admin/live-stream?token=${encodeURIComponent(token)}`;

      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!isSubscribed) return;
          console.log('[AdminLiveContext] 🟢 Live SSE Stream Connected to ASM Shine Backend.');
          setIsLiveConnected(true);
        };

        es.addEventListener('connected', (e) => {
          if (!isSubscribed) return;
          setIsLiveConnected(true);
        });

        es.addEventListener('new_order', (e) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(e.data);
            handleNewOrderReceived(data);
          } catch (err) {
            console.error('[AdminLiveContext] Failed to parse new_order payload:', err);
          }
        });

        es.addEventListener('order_status_changed', (e) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(e.data);
            handleStatusChanged(data);
          } catch (err) {
            console.error('[AdminLiveContext] Failed to parse status change payload:', err);
          }
        });

        es.onerror = (err) => {
          if (!isSubscribed) return;
          console.warn('[AdminLiveContext] SSE connection disconnected, scheduling auto-reconnect...', err);
          setIsLiveConnected(false);
          es.close();

          // Exponential backoff reconnect
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isSubscribed) connectSSE();
          }, 4000);
        };
      } catch (err) {
        console.error('[AdminLiveContext] EventSource initialization failed:', err);
        setIsLiveConnected(false);
      }
    };

    connectSSE();

    // Re-verify connection on tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLiveConnected) {
        connectSSE();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsLiveConnected(false);
    };
  }, [isAuthenticated, token, handleNewOrderReceived, handleStatusChanged]);

  return (
    <AdminLiveOrderContext.Provider
      value={{
        isLiveConnected,
        incomingOrders,
        unreadCount,
        latestAlert,
        soundEnabled,
        toggleSound,
        dismissAlert,
        markAllAsRead,
        subscribeOrderEvent
      }}
    >
      {children}
    </AdminLiveOrderContext.Provider>
  );
};

export const useAdminLiveOrder = () => {
  const context = useContext(AdminLiveOrderContext);
  if (!context) {
    throw new Error('useAdminLiveOrder must be used within an AdminLiveOrderProvider');
  }
  return context;
};
