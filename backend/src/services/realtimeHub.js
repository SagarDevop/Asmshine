const EventEmitter = require('events');

class RealtimeHub extends EventEmitter {
  constructor() {
    super();
    this.adminClients = new Set();
  }

  /**
   * SSE Stream Handler for Admin Dashboard & Orders
   */
  handleAdminStream(req, res) {
    // Set mandatory SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Prevents reverse proxies (Nginx/Render) from buffering
    });

    res.flushHeaders?.();

    const client = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user: req.user ? { id: req.user._id, name: req.user.name, role: req.user.role } : null,
      res
    };

    this.adminClients.add(client);
    console.log(`[RealtimeHub] Admin connected to live stream (${client.id}). Total active admins: ${this.adminClients.size}`);

    // Send initial handshake
    res.write(`event: connected\ndata: ${JSON.stringify({
      message: 'ASM Shine Realtime Admin Stream connected successfully.',
      timestamp: new Date().toISOString(),
      activeAdmins: this.adminClients.size
    })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`: ping ${Date.now()}\n\n`);
      } catch (err) {
        clearInterval(heartbeatInterval);
        this.adminClients.delete(client);
      }
    }, 20000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      this.adminClients.delete(client);
      console.log(`[RealtimeHub] Admin disconnected (${client.id}). Remaining admins: ${this.adminClients.size}`);
    });
  }

  /**
   * Broadcast message to all connected admin streams
   */
  broadcastToAdmins(eventName, payload) {
    if (this.adminClients.size === 0) return;

    const dataString = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.adminClients) {
      try {
        client.res.write(dataString);
      } catch (err) {
        console.warn(`[RealtimeHub] Error writing to admin client ${client.id}:`, err.message);
        this.adminClients.delete(client);
      }
    }
  }

  /**
   * Triggered when a new order is confirmed and saved to MongoDB
   */
  notifyNewOrder(orderDoc) {
    const formatted = {
      id: orderDoc.orderId,
      orderId: orderDoc.orderId,
      _id: orderDoc._id,
      customerName: orderDoc.shippingAddress?.fullName || orderDoc.user?.name || 'Customer',
      customerPhone: orderDoc.shippingAddress?.phone || orderDoc.user?.phone || '',
      customerEmail: orderDoc.user?.email || '',
      itemCount: orderDoc.items?.length || 0,
      items: orderDoc.items || [],
      totalAmount: orderDoc.totalAmount,
      pricing: orderDoc.pricing,
      status: orderDoc.status,
      paymentMethod: orderDoc.paymentMethod,
      paymentStatus: orderDoc.paymentStatus,
      createdAt: orderDoc.createdAt || new Date(),
      shippingCity: orderDoc.shippingAddress?.city || '',
      shippingState: orderDoc.shippingAddress?.state || ''
    };

    console.log(`[RealtimeHub] Broadcasting NEW ORDER #${formatted.orderId} (₹${formatted.totalAmount}) to ${this.adminClients.size} active admin clients.`);
    this.broadcastToAdmins('new_order', formatted);
    this.emit('new_order', formatted);
  }

  /**
   * Triggered when an order status changes (e.g. PROCESSING, SHIPPED, CANCELLED)
   */
  notifyOrderStatusChanged(orderId, status, details = {}) {
    const payload = {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...details
    };
    this.broadcastToAdmins('order_status_changed', payload);
    this.emit('order_status_changed', payload);
  }
}

module.exports = new RealtimeHub();
