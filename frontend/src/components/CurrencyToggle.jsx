import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencyToggle() {
  const { currency, setCurrency, toggleCurrency, rate } = useCurrency();

  const usdToInr = rate ? Math.round(1 / rate) : 86;

  return (
    <>
      <style>{`
        .currency-float-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
          animation: floatIn 0.4s ease-out;
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .currency-toggle-pill {
          display: inline-flex;
          align-items: center;
          height: 42px;
          box-sizing: border-box;
          background: #ffffff;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(124, 92, 252, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(124, 92, 252, 0.1);
          border-radius: 999px;
          padding: 4px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .currency-toggle-pill:hover {
          border-color: rgba(124, 92, 252, 0.65);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16), 0 0 20px rgba(124, 92, 252, 0.25);
          transform: translateY(-2px);
        }

        .currency-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 32px;
          box-sizing: border-box;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.5px;
        }

        .currency-btn.active {
          color: #ffffff;
          background: linear-gradient(135deg, #7c5cfc 0%, #5833ea 100%);
          box-shadow: 0 2px 10px rgba(124, 92, 252, 0.4);
        }

        .currency-btn:hover:not(.active) {
          color: #0f172a;
          background: #f1f5f9;
        }

        .currency-symbol {
          font-size: 14px;
          font-weight: 800;
        }

        .currency-rate-hint {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transform: translateX(6px);
          transition: all 0.2s ease;
        }

        .currency-float-container:hover .currency-rate-hint {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 600px) {
          .currency-float-container {
            bottom: 16px;
            right: 16px;
          }
          .currency-toggle-pill {
            height: 38px;
            padding: 3px;
          }
          .currency-btn {
            height: 30px;
            padding: 0 11px;
            font-size: 12px;
          }
          .currency-rate-hint {
            display: none;
          }
        }
      `}</style>

      <div className="currency-float-container" title="Click to switch currency between INR (₹) and USD ($)">
        <div className="currency-rate-hint">
          $1 ≈ ₹{usdToInr}
        </div>

        <div className="currency-toggle-pill" role="group" aria-label="Currency Selector">
          <button
            type="button"
            className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
            onClick={() => setCurrency('INR')}
            aria-pressed={currency === 'INR'}
          >
            <span className="currency-symbol">₹</span>
            <span>INR</span>
          </button>

          <button
            type="button"
            className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
            onClick={() => setCurrency('USD')}
            aria-pressed={currency === 'USD'}
          >
            <span className="currency-symbol">$</span>
            <span>USD</span>
          </button>
        </div>
      </div>
    </>
  );
}
