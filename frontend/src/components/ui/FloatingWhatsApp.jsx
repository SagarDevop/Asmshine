import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Business WhatsApp Phone Number:
 * Stored in international format without '+', spaces, or hyphens (India: 91 + 10 digits).
 * Configured from verified official ASM Shine helpline: +91 8901 271 271.
 */
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || '918901271271';
const PREDEFINED_MESSAGE = 'Hello! I need some assistance regarding your products.';

/**
 * Route Exclusion List:
 * The floating WhatsApp button must be completely hidden on:
 * - Login pages (/login)
 * - Sign-up / Registration pages (/signup)
 * - Password recovery (/forgot-password)
 * - Account section & profile (/account, /profile)
 * - Shopping cart page (/cart)
 * - Checkout page (/checkout)
 * - Payment-related pages (/payment)
 * - Admin subsystem (/admin)
 */
const EXCLUDED_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/account',
  '/profile',
  '/cart',
  '/checkout',
  '/admin',
  '/payment'
];

export const isWhatsAppExcluded = (pathname) => {
  if (!pathname) return false;
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return EXCLUDED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
};

export const FloatingWhatsApp = () => {
  const { pathname } = useLocation();

  if (isWhatsAppExcluded(pathname)) {
    return null;
  }

  const clickToChatUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(PREDEFINED_MESSAGE)}`;

  return (
    <>
      <style>{`
        .asm-whatsapp-float {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 52px;
          height: 52px;
          background-color: #25D366;
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.42), 0 2px 6px rgba(0, 0, 0, 0.12);
          z-index: 95;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .asm-whatsapp-float:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(37, 211, 102, 0.55), 0 3px 8px rgba(0, 0, 0, 0.16);
          color: #FFFFFF;
        }
        .asm-whatsapp-float:active {
          transform: scale(0.94);
        }
        .asm-whatsapp-float svg {
          width: 30px;
          height: 30px;
          fill: #FFFFFF;
        }
        @media (max-width: 768px) {
          .asm-whatsapp-float {
            bottom: 76px;
            right: 18px;
            width: 50px;
            height: 50px;
          }
          .asm-whatsapp-float svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
      <a
        href={clickToChatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="asm-whatsapp-float"
        aria-label="Chat with ASM Shine on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M16.002 0C7.164 0 0 7.164 0 16.002c0 2.823.738 5.568 2.14 7.998L.08 31.92l8.13-2.132a15.932 15.932 0 0 0 7.792 2.016h.007c8.834 0 15.998-7.164 15.998-16.002 0-4.275-1.666-8.293-4.693-11.32A15.93 15.93 0 0 0 16.002 0zm0 29.3c-2.4 0-4.752-.645-6.8-1.864l-.488-.29-5.06 1.327 1.35-4.93-.317-.505A13.252 13.252 0 0 1 2.7 16.002C2.7 8.667 8.668 2.7 16.002 2.7c3.553 0 6.894 1.384 9.406 3.896 2.512 2.513 3.894 5.854 3.894 9.406 0 7.335-5.968 13.3-13.3 13.3zm7.295-9.96c-.4-.2-2.368-1.168-2.735-1.302-.367-.133-.634-.2-.901.2-.267.4-1.034 1.302-1.268 1.568-.234.267-.467.3-.867.1-.4-.2-1.69-.623-3.22-1.986-1.19-1.062-1.994-2.373-2.228-2.773-.234-.4-.025-.617.175-.816.18-.18.4-.467.6-.7.2-.234.267-.4.4-.668.134-.267.067-.5-.033-.7-.1-.2-.901-2.17-1.235-2.97-.325-.78-.655-.674-.9-.686-.234-.012-.5-.015-.767-.015-.267 0-.7.1-1.067.5-.367.4-1.4 1.368-1.4 3.336 0 1.968 1.434 3.87 1.634 4.137.2.267 2.822 4.31 6.837 6.043.955.412 1.7.658 2.28.843.959.305 1.832.262 2.522.159.77-.115 2.368-.968 2.702-1.902.334-.934.334-1.734.234-1.902-.1-.168-.367-.268-.767-.468z" />
        </svg>
      </a>
    </>
  );
};

export default FloatingWhatsApp;
