// src/pages/Wishlist.jsx
import { useNavigate } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import ProductCard from '../components/ProductCard'
import STATIC_PRODUCTS from '../data/staticProducts'

export default function Wishlist({ onToast }) {
  const { ids } = useWishlistStore()
  const navigate = useNavigate()
  const products = STATIC_PRODUCTS.filter((p) => ids.includes(p.id))

  return (
    <div style={{ padding: '3rem 2.5rem' }}>
      <p className="section-label">Yêu thích</p>
      <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>
        Sản phẩm đã lưu
      </h2>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: 48, marginBottom: '1.5rem' }}>♡</div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--gray)',
              marginBottom: '1.5rem',
            }}
          >
            Chưa có sản phẩm yêu thích
          </p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>
            Khám phá Shop
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: '1.5rem' }}>
            {products.length} sản phẩm đã lưu
          </p>
          <div className="products-grid" style={{ background: 'var(--border-md)' }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onToast={onToast} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
