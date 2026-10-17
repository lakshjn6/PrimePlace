import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/client';

/**
 * OfferBanner
 * Visible only when:
 *   - user is NOT logged in, OR
 *   - user IS logged in but has placed ZERO orders
 */
export default function OfferBanner() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If user is guest (!user), order count is 0 -> show banner.
  // If user is logged in, check user.order_count (from AccountSerializer).
  // If user.order_count is > 0, hide banner.
  const hasOrders = user ? ((user.order_count ?? 0) > 0) : false;

  /* ── Don't render while auth is loading or if user already placed orders ─────── */
  if (authLoading) return null;
  if (hasOrders) return null;

  /* ── Banner ───────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');

        @keyframes offerFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 32px rgba(124,92,252,0.10); }
          50%       { box-shadow: 0 4px 40px rgba(29,185,84,0.10); }
        }

        .pm-banner-root {
          font-family: 'Poppins', system-ui, sans-serif;
          width: 100%;
          container-type: inline-size;
          text-decoration: none;
          display: block;
          cursor: pointer;
          animation: offerFadeIn 0.45s ease both;
        }

        .pm-card {
          box-sizing: border-box;
          width: 100%;
          aspect-ratio: 1200 / 270;
          display: flex;
          align-items: center;
          gap: 2.4cqw;
          padding: 1.8cqw 2.6cqw;
          border-radius: 2cqw;
          color: #fff;
          overflow: hidden;
          background:
            radial-gradient(circle at 0% 0%,   rgba(124, 92, 252, .30), transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(29, 185, 84,  .28), transparent 50%),
            #07070b;
          animation: pulseGlow 3.5s ease-in-out infinite;
        }

        /* ── Left copy ── */
        .pm-copy { flex: 0 0 41%; min-width: 0; }

        .pm-small {
          margin: 0;
          font-weight: 600;
          font-size: 2.4cqw;
          line-height: 1.2;
        }
        .pm-line {
          display: flex;
          align-items: center;
          gap: 1.2cqw;
          margin: 0;
          white-space: nowrap;
        }
        .pm-line b   { font-weight: 700; font-size: 4.6cqw; line-height: 1.15; color: #1db954; }
        .pm-line em  { font-style: normal; font-weight: 600; font-size: 2.1cqw; line-height: 1.15; }
        .pm-logo     { width: 3.6cqw; height: 3.6cqw; flex: none; }

        .pm-disclaimer {
          margin: 1.2cqw 0 0;
          font-weight: 500;
          font-size: 1.25cqw;
          color: #8e8ea2;
          letter-spacing: 0.02em;
        }

        /* ── Right steps box ── */
        .pm-box {
          flex: 1 1 0;
          min-width: 0;
          box-sizing: border-box;
          padding: 1.5cqw 1.8cqw 1.7cqw;
          border-radius: 1.8cqw;
          background: #0f0f18;
        }
        .pm-box h3 {
          margin: 0 0 1.2cqw;
          font-size: 1.8cqw;
          font-weight: 700;
          color: #f5b82e;
        }

        .pm-steps {
          list-style: none;
          margin: 0; padding: 0;
          counter-reset: s;
          display: flex;
        }
        .pm-steps li {
          counter-increment: s;
          position: relative;
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          font-weight: 600;
          font-size: 1.45cqw;
          line-height: 1.25;
          padding: 0 .3cqw;
          color: #ccc;
        }
        .pm-steps li::before {
          content: counter(s);
          width: 3cqw; height: 3cqw;
          margin-bottom: .9cqw;
          border-radius: 50%;
          background: #7c5cfc;
          display: grid; place-items: center;
          font-size: 1.5cqw; font-weight: 700;
          color: #fff;
          position: relative; z-index: 1;
        }
        /* connector line */
        .pm-steps li:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 1.4cqw;
          left: 50%;
          width: 100%;
          height: .2cqw;
          background: rgba(124,92,252,.5);
        }
        .pm-steps li:last-child       { color: #1db954; font-weight: 700; }
        .pm-steps li:last-child::before { background: #1db954; color: #07070b; }

        /* ── Mobile: stack vertically ── */
        @container (max-width: 520px) {
          .pm-card {
            aspect-ratio: unset;
            flex-direction: column;
            align-items: flex-start;
            padding: 4.5cqw 5cqw;
            gap: 4cqw;
            border-radius: 4cqw;
          }
          .pm-copy { flex: unset; width: 100%; }
          .pm-small { font-size: 5cqw; }
          .pm-line b { font-size: 9cqw; }
          .pm-line em { font-size: 4.5cqw; }
          .pm-logo    { width: 7.5cqw; height: 7.5cqw; }
          .pm-disclaimer { font-size: 2.8cqw; margin-top: 2cqw; }
          .pm-box { width: 100%; }
          .pm-box h3  { font-size: 4cqw; }
          .pm-steps li { font-size: 3cqw; }
          .pm-steps li::before { width: 6cqw; height: 6cqw; font-size: 3cqw; }
          .pm-steps li:not(:last-child)::after { top: 3cqw; }
        }
      `}</style>

      <div
        className="pm-banner-root"
        role="banner"
        aria-label="Spotify free up to 3 months for new registrations"
        onClick={() => navigate(user ? '/products?search=Spotify' : '/register')}
      >
        <div className="pm-card">

          {/* ── Left: copy ── */}
          <div className="pm-copy">
            <p className="pm-small">{user ? '' : 'Register today for'}</p>
            <p className="pm-line">
              <b>Spotify free</b>
              {/* Spotify logo SVG */}
              <svg className="pm-logo" viewBox="0 0 76 76" aria-hidden="true">
                <circle cx="38" cy="38" r="38" fill="#1db954" />
                <g fill="none" stroke="#07070b" strokeLinecap="round">
                  <path d="M13 26 Q40 17 66 32" strokeWidth="7.5" />
                  <path d="M16 40 Q40 33 63 45" strokeWidth="6" />
                  <path d="M20 53 Q40 48 58 56" strokeWidth="5" />
                </g>
              </svg>
            </p>
            <p className="pm-small">up to 3 months</p>
            <p className="pm-disclaimer">* only for new users</p>
          </div>

          {/* ── Right: how-to steps ── */}
          <div className="pm-box">
            <h3>How to get it</h3>
            <ol className="pm-steps">
              <li>{user ? 'Logged in' : 'Register'}</li>
              <li>Search Spotify</li>
              <li>Make ₹0 payment</li>
              <li>Place order</li>
              <li>Delivered in 24 hrs</li>
            </ol>
          </div>

        </div>
      </div>
    </>
  );
}
