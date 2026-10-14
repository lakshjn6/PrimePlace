import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Default fallback: 1 INR ≈ 0.0116 USD (i.e. ~$1 = ₹86)
const DEFAULT_INR_TO_USD_RATE = 0.0116;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('preferred_currency') || 'INR';
  });
  const [rate, setRate] = useState(DEFAULT_INR_TO_USD_RATE);

  useEffect(() => {
    let isMounted = true;
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.rates?.USD) {
          setRate(data.rates.USD);
        }
      })
      .catch(() => {
        // Keep fallback rate silently if offline or blocked
      });
    return () => { isMounted = false; };
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => {
      const next = prev === 'INR' ? 'USD' : 'INR';
      localStorage.setItem('preferred_currency', next);
      return next;
    });
  };

  const changeCurrency = (target) => {
    if (target === 'INR' || target === 'USD') {
      setCurrency(target);
      localStorage.setItem('preferred_currency', target);
    }
  };

  /**
   * Format an amount in INR to either INR (₹) or USD ($)
   */
  const formatPrice = (amountInINR) => {
    const num = parseFloat(amountInINR);
    if (isNaN(num)) return '₹0';

    if (currency === 'USD') {
      const inUsd = (num * rate).toFixed(2);
      return `$${inUsd}`;
    }

    // Default INR format
    // If it's a whole number, format without .00, otherwise with 2 decimals
    const formatted = num % 1 === 0 ? num.toLocaleString('en-IN') : num.toFixed(2);
    return `₹${formatted}`;
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <CurrencyContext.Provider value={{
      currency,
      rate,
      symbol,
      toggleCurrency,
      setCurrency: changeCurrency,
      formatPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
