import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured',           icon: '⭐' },
  { value: 'price_low',  label: 'Price: Low to High', icon: '📈' },
  { value: 'price_high', label: 'Price: High to Low', icon: '📉' },
  { value: 'newest',     label: 'Newest First',       icon: '🕒' },
];

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user }      = useAuth();

  // Dropdown open states
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen,   setSortOpen]   = useState(false);

  const filterRef = useRef(null);
  const sortRef   = useRef(null);

  // Active query parameters
  const activeCategory = searchParams.get('category') || '';
  const activeSort     = searchParams.get('sort') || 'featured';
  const minPriceParam  = searchParams.get('min_price') || '';
  const maxPriceParam  = searchParams.get('max_price') || '';

  // Local filter draft states inside dropdown
  const [draftCategory, setDraftCategory] = useState(activeCategory);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Sync draft states with URL
  useEffect(() => {
    setDraftCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setMaxPriceInput(maxPriceParam);
  }, [maxPriceParam]);

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch categories
  useEffect(() => {
    storeAPI.getCategories().then(r => setCategories(r.data));
  }, []);

  // Fetch products with filters
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (minPriceParam)  params.min_price = minPriceParam;
    if (maxPriceParam)  params.max_price = maxPriceParam;
    if (activeSort)     params.sort = activeSort;

    storeAPI.getProducts(params)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [activeCategory, minPriceParam, maxPriceParam, activeSort]);

  // Apply filters from Filter dropdown
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    const next = new URLSearchParams(searchParams);

    if (draftCategory) {
      next.set('category', draftCategory);
    } else {
      next.delete('category');
    }

    if (minPriceInput) {
      next.set('min_price', minPriceInput);
    } else {
      next.delete('min_price');
    }

    if (maxPriceInput) {
      next.set('max_price', maxPriceInput);
    } else {
      next.delete('max_price');
    }

    setSearchParams(next);
    setFilterOpen(false);
  };

  // Select sort option from Sort dropdown
  const handleSelectSort = (sortVal) => {
    const next = new URLSearchParams(searchParams);
    if (sortVal && sortVal !== 'featured') {
      next.set('sort', sortVal);
    } else {
      next.delete('sort');
    }
    setSearchParams(next);
    setSortOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDraftCategory('');
    setMinPriceInput('');
    setMaxPriceInput('');
    const next = new URLSearchParams();
    if (activeSort && activeSort !== 'featured') {
      next.set('sort', activeSort);
    }
    setSearchParams(next);
    setFilterOpen(false);
  };

  const handleClearAll = () => {
    setDraftCategory('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
    setFilterOpen(false);
    setSortOpen(false);
  };

  // Count active filters (category + price range)
  let activeFilterCount = 0;
  if (activeCategory) activeFilterCount++;
  if (minPriceParam || maxPriceParam) activeFilterCount++;

  const hasAnyActive = Boolean(
    activeCategory || minPriceParam || maxPriceParam || (activeSort && activeSort !== 'featured')
  );

  const activeSortObj = SORT_OPTIONS.find(s => s.value === activeSort) || SORT_OPTIONS[0];

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(productId);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        .prod-btn-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }
        .prod-triggers-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .prod-pop-wrap {
          position: relative;
        }

        /* Trigger Buttons */
        .prod-menu-btn {
          background: #0e0e14;
          border: 1px solid #232334;
          color: #e2e8f0;
          border-radius: 12px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          user-select: none;
        }
        .prod-menu-btn:hover {
          border-color: #7c5cfc;
          background: #14131f;
        }
        .prod-menu-btn.active {
          border-color: #7c5cfc;
          background: rgba(124, 92, 252, 0.12);
          box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
        }
        .prod-menu-btn.has-value {
          border-color: rgba(124, 92, 252, 0.6);
          color: #c4b5fd;
        }
        .prod-badge-count {
          background: #7c5cfc;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 12px;
          line-height: 1.4;
        }
        .prod-caret {
          font-size: 11px;
          color: #888;
          transition: transform 0.2s ease;
        }
        .prod-caret.up {
          transform: rotate(180deg);
        }

        /* Dropdown Popover Panels */
        .prod-dropdown-card {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #0c0c14;
          border: 1px solid #242438;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
          z-index: 100;
          animation: popSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Filter Dropdown Specific */
        .prod-filter-dropdown {
          width: 320px;
          max-width: 92vw;
          padding: 18px;
          box-sizing: border-box;
        }
        .prod-drop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1a1a28;
        }
        .prod-drop-title {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .prod-drop-clear {
          background: none;
          border: none;
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .prod-drop-clear:hover {
          text-decoration: underline;
        }

        .prod-drop-section {
          margin-bottom: 16px;
        }
        .prod-section-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
          display: block;
        }
        .prod-cat-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 180px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .prod-cat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: #ccc;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .prod-cat-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }
        .prod-cat-item.selected {
          background: rgba(124, 92, 252, 0.14);
          border-color: rgba(124, 92, 252, 0.4);
          color: #a78bfa;
          font-weight: 700;
        }

        /* Price Input Box in Filter Menu */
        .prod-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .prod-price-field {
          flex: 1;
          display: flex;
          align-items: center;
          background: #050508;
          border: 1px solid #232334;
          border-radius: 8px;
          padding: 6px 8px;
          gap: 4px;
        }
        .prod-price-field:focus-within {
          border-color: #7c5cfc;
        }
        .prod-price-sym {
          color: #7c5cfc;
          font-size: 13px;
          font-weight: 700;
        }
        .prod-price-inp {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          width: 100%;
          outline: none;
        }

        .prod-filter-actions {
          display: flex;
          gap: 8px;
          margin-top: 18px;
          padding-top: 12px;
          border-top: 1px solid #1a1a28;
        }
        .prod-apply-btn {
          flex: 1;
          background: #7c5cfc;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .prod-apply-btn:hover {
          background: #6a49f5;
        }
        .prod-cancel-btn {
          background: #14141e;
          border: 1px solid #28283a;
          color: #aaa;
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 13px;
          cursor: pointer;
        }
        .prod-cancel-btn:hover {
          color: #fff;
        }

        /* Sort Dropdown Specific */
        .prod-sort-dropdown {
          width: 220px;
          padding: 8px;
        }
        .prod-sort-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #ccc;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .prod-sort-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .prod-sort-item.selected {
          background: rgba(124, 92, 252, 0.14);
          color: #a78bfa;
          font-weight: 700;
        }

        .prod-right-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .prod-total-count {
          color: #777;
          font-size: 13px;
          font-weight: 600;
        }
        .prod-clear-pill {
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.25);
          color: #ff6b6b;
          border-radius: 16px;
          padding: 3px 10px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .prod-clear-pill:hover {
          background: rgba(255, 77, 77, 0.16);
        }

        @media (max-width: 768px) {
          .prod-btn-bar {
            margin-bottom: 16px;
          }
          .prod-triggers-row {
            width: 100%;
            justify-content: flex-start;
          }
          .prod-right-info {
            width: 100%;
            justify-content: space-between;
            margin-top: 4px;
          }
        }
      `}</style>

      <div style={{ ...s.container, padding: isMobile ? '24px 12px' : '48px 24px' }}>
        <h1 style={{ ...s.title, fontSize: isMobile ? 22 : 36, marginBottom: isMobile ? 16 : 24 }}>
          All Subscription Plans
        </h1>

        {/* ── Action Bar with Filter & Sort Dropdown Buttons ── */}
        <div className="prod-btn-bar">
          <div className="prod-triggers-row">

            {/* Filter Dropdown Menu Trigger */}
            <div className="prod-pop-wrap" ref={filterRef}>
              <button
                type="button"
                className={`prod-menu-btn ${filterOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-value' : ''}`}
                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="prod-badge-count">{activeFilterCount}</span>
                )}
                <span className={`prod-caret ${filterOpen ? 'up' : ''}`}>▾</span>
              </button>

              {/* Filter Dropdown Menu */}
              {filterOpen && (
                <div className="prod-dropdown-card prod-filter-dropdown">
                  <div className="prod-drop-header">
                    <span className="prod-drop-title">Filter Plans</span>
                    {(draftCategory || minPriceInput || maxPriceInput) && (
                      <button type="button" onClick={handleResetFilters} className="prod-drop-clear">
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Section 1: Category */}
                  <div className="prod-drop-section">
                    <span className="prod-section-label">Category</span>
                    <div className="prod-cat-list">
                      <button
                        type="button"
                        className={`prod-cat-item ${draftCategory === '' ? 'selected' : ''}`}
                        onClick={() => setDraftCategory('')}
                      >
                        <span>All Categories</span>
                        {draftCategory === '' && <span>✓</span>}
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`prod-cat-item ${draftCategory === cat.slug ? 'selected' : ''}`}
                          onClick={() => setDraftCategory(cat.slug)}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>{cat.icon || '📦'}</span>
                            <span>{cat.name}</span>
                          </span>
                          {draftCategory === cat.slug && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Price Max-Min Value */}
                  <div className="prod-drop-section">
                    <span className="prod-section-label">Price Range</span>
                    <div className="prod-price-row">
                      <div className="prod-price-field">
                        <span className="prod-price-sym">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(e.target.value)}
                          className="prod-price-inp"
                          min="0"
                        />
                      </div>
                      <span style={{ color: '#555', fontSize: 13 }}>–</span>
                      <div className="prod-price-field">
                        <span className="prod-price-sym">₹</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(e.target.value)}
                          className="prod-price-inp"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Action Buttons */}
                  <div className="prod-filter-actions">
                    <button type="button" onClick={() => setFilterOpen(false)} className="prod-cancel-btn">
                      Cancel
                    </button>
                    <button type="button" onClick={handleApplyFilter} className="prod-apply-btn">
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown Menu Trigger */}
            <div className="prod-pop-wrap" ref={sortRef}>
              <button
                type="button"
                className={`prod-menu-btn ${sortOpen ? 'active' : ''} ${activeSort !== 'featured' ? 'has-value' : ''}`}
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                <span>Sort: <strong>{activeSortObj.label}</strong></span>
                <span className={`prod-caret ${sortOpen ? 'up' : ''}`}>▾</span>
              </button>

              {/* Sort Dropdown Menu */}
              {sortOpen && (
                <div className="prod-dropdown-card prod-sort-dropdown">
                  <div style={{ padding: '6px 12px 8px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Sort By
                  </div>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`prod-sort-item ${activeSort === opt.value ? 'selected' : ''}`}
                      onClick={() => handleSelectSort(opt.value)}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </span>
                      {activeSort === opt.value && <span style={{ color: '#7c5cfc' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Meta Info & Clear Button */}
          <div className="prod-right-info">
            <span className="prod-total-count">
              {products.length} {products.length === 1 ? 'plan' : 'plans'}
            </span>
            {hasAnyActive && (
              <button
                type="button"
                onClick={handleClearAll}
                className="prod-clear-pill"
                title="Clear all active filters"
              >
                ✕ Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Products Grid — 2 products per line on mobile ── */}
        {loading ? (
          <div style={{
            ...s.loading,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '10px 8px' : 24,
          }}>
            {[...Array(6)].map((_, i) => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <p style={{fontSize:48}}>📭</p>
            <p style={{color:'#fff', fontWeight: 700, margin: '8px 0 4px', fontSize: 18}}>No plans found</p>
            <p style={{color:'#666', fontSize: 14, margin: '0 0 16px'}}>Try adjusting your filters or price range.</p>
            {hasAnyActive && (
              <button onClick={handleClearAll} className="prod-apply-btn" style={{ padding: '8px 20px', width: 'auto' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{
            ...s.grid,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '10px 8px' : 24,
          }}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} isMobile={isMobile} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Gradient palettes cycling per category
const GRADIENTS = [
  'linear-gradient(135deg, #1a0533 0%, #3b1278 50%, #7c5cfc 100%)',
  'linear-gradient(135deg, #0a2a1a 0%, #0d5c3a 50%, #00c97a 100%)',
  'linear-gradient(135deg, #1a0a00 0%, #6b2c00 50%, #ff7c20 100%)',
  'linear-gradient(135deg, #001a2e 0%, #003d6b 50%, #0099ff 100%)',
  'linear-gradient(135deg, #1a001a 0%, #6b006b 50%, #e040fb 100%)',
  'linear-gradient(135deg, #1a1a00 0%, #5c5a00 50%, #d4c400 100%)',
];

function ProductCard({ product, isMobile = false, onAddToCart }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [imgError, setImgError] = React.useState(false);
  const gradient = GRADIENTS[(product.id || 0) % GRADIENTS.length];
  const hasZeroOrders = !user || (user.order_count ?? 0) === 0;
  const showDiscount = hasZeroOrders && product.discounted_price !== null && product.discounted_price !== undefined;

  return (
    <div
      style={{
        ...s.card,
        borderRadius: isMobile ? 14 : 20,
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/products/${product.slug}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#7c5cfc';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 92, 252, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e1e2e';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >

      {/* ── Product Image (no featured ribbon) ── */}
      <div style={{ ...s.imgWrapper, height: isMobile ? 115 : 180 }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={s.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ ...s.imgPlaceholder, background: gradient }}>
            <span style={{ ...s.placeholderIcon, fontSize: isMobile ? 36 : 52 }}>
              {product.category_icon || '📦'}
            </span>
            <span style={s.placeholderName}>{product.category_name}</span>
          </div>
        )}
      </div>

      <div style={{ ...s.cardTop, padding: isMobile ? '8px 10px 0' : '14px 18px 0' }}>
        <span style={{ ...s.catBadge, fontSize: isMobile ? 9.5 : 11, padding: isMobile ? '2px 7px' : '4px 10px' }}>
          {product.category_name}
        </span>
      </div>

      <h3 style={{
        ...s.cardName,
        fontSize: isMobile ? 13 : 20,
        padding: isMobile ? '0 10px' : '0 18px',
        margin: isMobile ? '4px 0 0' : '6px 0 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {product.name}
      </h3>

      {/* ── Product Description (shown on every card, feature list removed) ── */}
      <p style={{
        ...s.cardDesc,
        fontSize: isMobile ? 11 : 13.5,
        lineHeight: 1.4,
        padding: isMobile ? '0 10px' : '0 18px',
        margin: isMobile ? '4px 0 8px' : '6px 0 12px',
        display: '-webkit-box',
        WebkitLineClamp: isMobile ? 2 : 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flexGrow: 1,
      }}>
        {product.description || 'Access premium features with instant automated delivery.'}
      </p>

      <div style={{
        ...s.cardFooter,
        padding: isMobile ? '8px 10px 10px' : '14px 18px 18px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 8 : 12,
      }}>
        <div>
          {showDiscount ? (
            <div>
              <span style={{ textDecoration: 'line-through', color: '#777', fontSize: isMobile ? 11 : 14, marginRight: 4 }}>
                {formatPrice(product.price)}
              </span>
              <span style={{ ...s.price, color: '#1db954', fontSize: isMobile ? 16 : 26 }}>
                {parseFloat(product.discounted_price) === 0 ? 'FREE (₹0)' : formatPrice(product.discounted_price)}
              </span>
            </div>
          ) : (
            <span style={{ ...s.price, fontSize: isMobile ? 16 : 26 }}>{formatPrice(product.price)}</span>
          )}
          <span style={{ ...s.cycle, fontSize: isMobile ? 10.5 : 13 }}>/{product.billing_cycle}</span>
        </div>
        <div style={{ ...s.cardActions, width: isMobile ? '100%' : 'auto', gap: isMobile ? 6 : 8 }}>
          <span
            style={{
              ...s.viewBtn,
              flex: isMobile ? 1 : 'initial',
              textAlign: 'center',
              fontSize: isMobile ? 11.5 : 13,
              padding: isMobile ? '6px 8px' : '8px 14px',
              cursor: 'pointer',
              display: 'inline-block',
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.slug}`);
            }}
          >
            Details
          </span>
          <button
            style={{
              ...s.addBtn,
              flex: isMobile ? 1 : 'initial',
              textAlign: 'center',
              fontSize: isMobile ? 11.5 : 13,
              padding: isMobile ? '6px 8px' : '8px 16px',
              whiteSpace: 'nowrap',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id, e);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  container: { maxWidth:1200, margin:'0 auto', padding:'48px 24px' },
  title: { fontSize:36, fontWeight:800, marginBottom:32, fontFamily:'Georgia,serif' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:24 },
  loading: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:24 },
  skeleton: { background:'#0e0e12', height:320, borderRadius:16, animation:'pulse 1.5s infinite' },
  empty: { textAlign:'center', padding:'80px 0' },
  card: { background:'#0e0e12', border: '1px solid #1e1e2e', borderRadius:20, padding:0, display:'flex', flexDirection:'column', gap:0, transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s', overflow:'hidden' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px 0' },
  catBadge: { background:'rgba(124,92,252,0.15)', color:'#7c5cfc', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, letterSpacing:0.5 },
  cardName: { color:'#fff', fontWeight:700, fontSize:20, margin:0, padding:'0 18px' },
  cardDesc: { color:'#888', fontSize:14, lineHeight:1.5, margin:0 },
  cardFooter: { marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, padding:'14px 18px 18px' },
  price: { color:'#7c5cfc', fontWeight:800, fontSize:26 },
  cycle: { color:'#555', fontSize:13 },
  cardActions: { display:'flex', gap:8 },
  viewBtn: { textDecoration:'none', color:'#aaa', border:'1px solid #2a2a2a', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:500 },
  addBtn: { background:'#7c5cfc', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' },
  imgWrapper: { position:'relative', width:'100%', height:180, overflow:'hidden', background:'#111' },
  img: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  imgPlaceholder: { width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 },
  placeholderIcon: { fontSize:52, lineHeight:1, filter:'drop-shadow(0 2px 12px rgba(0,0,0,0.5))' },
  placeholderName: { color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase' },
};
