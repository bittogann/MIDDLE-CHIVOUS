// src/pages/Shop.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../utils/api';
import STATIC_PRODUCTS from '../data/staticProducts';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Tee', label: 'Áo Tee' },
  { id: 'Hoodie', label: 'Hoodie & Jacket' },
  { id: 'Pants', label: 'Quần' },
  { id: 'Accessories', label: 'Phụ kiện' }
];

const PRICES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'low', label: 'Dưới 400k', min: 0, max: 400000 },
  { id: 'mid', label: '400k – 700k', min: 400000, max: 700000 },
  { id: 'high', label: 'Trên 700k', min: 700000, max: Infinity }
];

const COLORS = [
  { name: 'Đen', hex: '#111' },
  { name: 'Trắng', hex: '#fff' },
  { name: 'Beige', hex: '#c8b89a' },
  { name: 'Olive', hex: '#6b8e6b' },
  { name: 'Xám', hex: '#8b7d7b' },
  { name: 'Navy', hex: '#2f4f8f' }
];

export default function Shop({ onToast }) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('newest');
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || 'all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [colorFilters, setColorFilters] = useState([]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCatFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const priceObj = PRICES.find(p => p.id === priceFilter);
    const params = {
      sort,
      ...(catFilter !== 'all' && { category: catFilter }),
      ...(priceFilter !== 'all' && priceObj && { minPrice: priceObj.min, maxPrice: priceObj.max }),
      ...(colorFilters.length && { color: colorFilters.join(',') })
    };

    getProducts(params)
      .then(res => setProducts(res.data.products))
      .catch(() => {
        // fallback to static filtering
        let p = [...STATIC_PRODUCTS];
        if (catFilter !== 'all') p = p.filter(x => x.category === catFilter);
        if (priceFilter !== 'all' && priceObj) p = p.filter(x => x.price >= priceObj.min && x.price <= priceObj.max);
        if (colorFilters.length) p = p.filter(x => x.colors.some(c => colorFilters.includes(c.hex)));
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, [catFilter, priceFilter, colorFilters, sort]);

  const toggleColor = (hex) => {
    setColorFilters(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]);
  };

  return (
    <div className="shop-layout">
      {/* SIDEBAR */}
      <aside className="shop-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Danh mục</div>
          {CATEGORIES.map(cat => (
            <button key={cat.id} id={`cat-${cat.id}`}
              className={`filter-option${catFilter === cat.id ? ' active' : ''}`}
              onClick={() => setCatFilter(cat.id)}>
              {cat.label}
              <span className="count">{STATIC_PRODUCTS.filter(p => cat.id === 'all' || p.category === cat.id).length}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-title">Giá</div>
          {PRICES.map(p => (
            <button key={p.id} className={`filter-option${priceFilter === p.id ? ' active' : ''}`}
              onClick={() => setPriceFilter(p.id)}>{p.label}</button>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-title">Màu sắc</div>
          {COLORS.map(c => (
            <button key={c.hex} className={`filter-option${colorFilters.includes(c.hex) ? ' active' : ''}`}
              onClick={() => toggleColor(c.hex)}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,.15)', display: 'inline-block' }} />
              {c.name}
            </button>
          ))}
        </div>
        {(catFilter !== 'all' || priceFilter !== 'all' || colorFilters.length > 0) && (
          <button className="filter-option" style={{ color: '#d44', marginTop: '1rem' }}
            onClick={() => { setCatFilter('all'); setPriceFilter('all'); setColorFilters([]); }}>
            ✕ Xoá tất cả bộ lọc
          </button>
        )}
      </aside>

      {/* MAIN */}
      <main className="shop-main">
        <div className="shop-toolbar">
          <span className="results-count">{products.length} sản phẩm</span>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Đang tải...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray)' }}>Không tìm thấy sản phẩm nào.</div>
        ) : (
          <div className="products-grid" style={{ background: 'var(--border-md)' }}>
            {products.map(p => <ProductCard key={p.id} product={p} onToast={onToast} />)}
          </div>
        )}
      </main>
    </div>
  );
}
