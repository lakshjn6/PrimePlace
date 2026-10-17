import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const DEBOUNCE_MS = 320;

export default function SearchBar({ onClose }) {
  const { user }                = useAuth();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [suggestion, setSugg]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState(-1);   // keyboard index

  const inputRef    = useRef(null);
  const dropRef     = useRef(null);
  const timerRef    = useRef(null);
  const navigate    = useNavigate();
  const { formatPrice } = useCurrency();

  // ── Debounced search ───────────────────────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([]); setSugg(null); setOpen(false); return;
    }
    setLoading(true);
    try {
      const { data } = await storeAPI.searchProducts(q);
      setResults(data.results || []);
      setSugg(data.suggestion || null);
      setOpen(true);
      setActive(-1);
    } catch {
      setResults([]); setSugg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query, doSearch]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKey = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) {
        goTo(results[active]);
      } else if (query.trim()) {
        goToSearch(query);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      if (onClose) onClose();
    }
  };

  const goTo = (product) => {
    setOpen(false);
    setQuery('');
    if (onClose) onClose();
    navigate(`/products/${product.slug}`);
  };

  const goToSearch = (q) => {
    setOpen(false);
    setQuery('');
    if (onClose) onClose();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const applySuggestion = () => {
    if (suggestion) {
      // extract the quoted word from "Did you mean X?"
      const match = suggestion.match(/"(.+?)"/);
      if (match) setQuery(match[1]);
    }
  };

  return (
    <div style={s.wrapper}>
      {/* ── Input ── */}
      <div style={s.inputWrap}>
        <span style={s.icon}>
          {loading
            ? <span style={s.spinner} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
          }
        </span>
        <input
          ref={inputRef}
          style={s.input}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search products… (e.g. Netflix, Spotify)"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
        {query && (
          <button style={s.clearBtn} onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}>
            ✕
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div ref={dropRef} style={s.drop}>

          {/* Spell correction banner */}
          {suggestion && (
            <div style={s.suggBanner}>
              <span style={s.suggText}>🔤 {suggestion}</span>
              <button style={s.suggBtn} onClick={applySuggestion}>Use it</button>
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            <>
              <div style={s.dropHeader}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    ...s.item,
                    ...(i === active ? s.itemActive : {}),
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(-1)}
                  onClick={() => goTo(p)}
                >
                  {/* Product image / icon */}
                  <div style={s.itemImg}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={s.img} />
                      : <span style={s.imgPlaceholder}>{p.category_icon || '📦'}</span>
                    }
                  </div>

                  {/* Text */}
                  <div style={s.itemBody}>
                    <div style={s.itemName}>
                      <HighlightMatch text={p.name} query={query} />
                    </div>
                    <div style={s.itemMeta}>
                      {p.category_name} · {p.billing_cycle?.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={s.itemPrice}>
                    {(() => {
                      const hasZeroOrders = !user || (user.order_count ?? 0) === 0;
                      const showDiscount = hasZeroOrders && p.discounted_price !== null && p.discounted_price !== undefined;
                      if (showDiscount) {
                        return (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ textDecoration: 'line-through', color: '#666', fontSize: 12, marginRight: 5 }}>
                              {formatPrice(p.price)}
                            </span>
                            <span style={{ color: '#1db954', fontWeight: 800 }}>
                              {parseFloat(p.discounted_price) === 0 ? 'FREE (₹0)' : formatPrice(p.discounted_price)}
                            </span>
                          </div>
                        );
                      }
                      return formatPrice(p.price);
                    })()}
                  </div>
                </div>
              ))}

              {/* View all */}
              <div style={s.viewAll} onClick={() => goToSearch(query)}>
                <span>View all results for "<strong>{query}</strong>"</span>
                <span>→</span>
              </div>
            </>
          ) : (
            !loading && (
              <div style={s.empty}>
                <span style={{ fontSize: 32 }}>🔍</span>
                <span style={{ color: '#888', fontSize: 14 }}>No products found for "<strong style={{color:'#aaa'}}>{query}</strong>"</span>
                {suggestion && (
                  <button style={s.suggBtn} onClick={applySuggestion}>
                    Try: {suggestion.match(/"(.+?)"/)?.[1]}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Highlight matched text ────────────────────────────────────────────────────
function HighlightMatch({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#7c5cfc44', color: '#a78bfa', borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 560,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#111',
    border: '1.5px solid #2a2a3a',
    borderRadius: 12,
    padding: '0 14px',
    gap: 10,
    transition: 'border-color 0.2s',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid #333',
    borderTopColor: '#7c5cfc',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 14,
    padding: '11px 0',
    minWidth: 0,
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px 0',
    flexShrink: 0,
  },

  // Dropdown
  drop: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    background: '#0e0e14',
    border: '1px solid #2a2a3a',
    borderRadius: 14,
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    overflow: 'hidden',
    zIndex: 9999,
    animation: 'fadeSlideDown 0.18s ease',
  },
  dropHeader: {
    padding: '8px 16px',
    fontSize: 11,
    color: '#555',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderBottom: '1px solid #1e1e2e',
  },

  // Suggestion banner
  suggBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '10px 16px',
    background: 'rgba(124,92,252,0.08)',
    borderBottom: '1px solid #2a2a3a',
    flexWrap: 'wrap',
  },
  suggText: { color: '#a78bfa', fontSize: 13 },
  suggBtn: {
    background: '#7c5cfc',
    border: 'none',
    color: '#fff',
    borderRadius: 6,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Result item
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid #13131e',
  },
  itemActive: {
    background: 'rgba(124,92,252,0.12)',
  },
  itemImg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { fontSize: 20 },

  itemBody: { flex: 1, minWidth: 0 },
  itemName: { color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemMeta: { color: '#666', fontSize: 12, marginTop: 2 },
  itemPrice: { color: '#7c5cfc', fontWeight: 700, fontSize: 14, flexShrink: 0 },

  // View all
  viewAll: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    color: '#7c5cfc',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'rgba(124,92,252,0.05)',
    transition: 'background 0.15s',
  },

  // Empty state
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '28px 16px',
    textAlign: 'center',
  },
};
