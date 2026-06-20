// src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../utils/api'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import ProductCard from '../components/ProductCard'
import ProductSVG from '../components/ProductSVG'
import STATIC_PRODUCTS from '../data/staticProducts'
import { fmt } from '../utils/format'
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '${BASE}'
export default function ProductDetail({ onToast, onCartOpen }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [colorIdx, setColorIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  const { addItem } = useCartStore()
  const { ids, toggle } = useWishlistStore()

  useEffect(() => {
    setLoading(true)
    setColorIdx(0); setSelectedSize(null); setQty(1); setAdded(false)
    getProduct(id)
      .then((res) => {
        setProduct(res.data.product)
        setRelated(res.data.related)
      })
      .catch(() => {
        const p = STATIC_PRODUCTS.find(
          (x) => String(x.id) === String(id) || x.slug === id
        )
        if (!p) { navigate('/shop'); return }
        setProduct(p)
        setRelated(
          STATIC_PRODUCTS
            .filter((x) => x.id !== p.id && x.category === p.category)
            .slice(0, 4)
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ padding: '8rem', textAlign: 'center', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gray)' }}>
      Loading...
    </div>
  )
  if (!product) return null

  const isWishlisted = ids.includes(product.id)

  const outOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (outOfStock) { onToast?.('Sản phẩm đã hết hàng!'); return }
    if (!selectedSize) { onToast?.('Vui lòng chọn size!'); return }
    if (qty > product.stock) { onToast?.(`Chỉ còn ${product.stock} sản phẩm trong kho!`); return }
    addItem(product, selectedSize, colorIdx, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    onToast?.('Đã thêm vào giỏ hàng!')
    onCartOpen?.()
  }

  const accordions = [
    { key: 'desc', title: 'Mô tả sản phẩm', body: product.desc },
    { key: 'material', title: 'Chất liệu', body: product.material },
    { key: 'care', title: 'Hướng dẫn bảo quản', body: product.care },
    { key: 'return', title: 'Chính sách đổi trả', body: 'Đổi trả miễn phí trong 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng. Liên hệ hotline hoặc email để được hỗ trợ.' },
  ]

  return (
    <div>
      <button
        style={{ padding: '1rem 2.5rem', background: 'none', border: 'none', fontSize: 13, color: 'var(--gray)', cursor: 'pointer', letterSpacing: '.06em' }}
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </button>

      <div className="product-detail">
        {/* IMAGES */}
        <div className="pd-images">
          <div className="pd-main-img">
            {product.images?.[colorIdx] || product.images?.[0]
              ? <img
                  src={`${BASE}${product.images[colorIdx] || product.images[0]}`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff', display: 'block' }}
                />
              : <ProductSVG product={product} colorIdx={colorIdx} />
            }
          </div>
          <div className="pd-thumbnails">
            {product.images?.length > 0
              ? product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb${i === colorIdx ? ' active' : ''}`}
                    onClick={() => setColorIdx(i)}
                  >
                    <img src={`${BASE}${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff' }} />
                  </div>
                ))
              : product.colors?.map((c, i) => (
                  <div
                    key={i}
                    className={`pd-thumb${i === colorIdx ? ' active' : ''}`}
                    onClick={() => setColorIdx(i)}
                  >
                    <ProductSVG product={product} colorIdx={i} size="thumb" />
                  </div>
                ))
            }
          </div>
        </div>

        {/* INFO */}
        <div className="pd-info">
          <div className="pd-brand">MIDDLE CHIVOUS / {product.category}</div>
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-price-row">
            <span className="pd-price">{fmt(product.price)}</span>
            {product.oldPrice && (
              <span className="pd-price-old">{fmt(product.oldPrice)}</span>
            )}
          </div>

          {outOfStock ? (
            <p style={{ color: '#c0392b', fontSize: 13, fontWeight: 600, marginBottom: '1rem' }}>
              ✕ Sản phẩm tạm hết hàng
            </p>
          ) : product.stock <= 5 ? (
            <p style={{ color: '#e67e22', fontSize: 13, fontWeight: 600, marginBottom: '1rem' }}>
              ⚠ Chỉ còn {product.stock} sản phẩm
            </p>
          ) : null}


          {/* COLOR */}
          <p className="pd-section-title">
            Màu sắc:{' '}
            <strong style={{ color: 'var(--black)', letterSpacing: 0, textTransform: 'none' }}>
              {product.colors?.[colorIdx]?.name}
            </strong>
          </p>
          <div className="color-options" style={{ marginBottom: '1.5rem' }}>
            {product.colors?.map((c, i) => (
              <div
                key={i}
                className={`color-swatch${i === colorIdx ? ' active' : ''}`}
                style={{
                  background: c.hex === '#fff' ? '#f5f5f5' : c.hex,
                  borderWidth: i === colorIdx ? 3 : 2,
                  width: 30, height: 30, borderRadius: '50%',
                  border: `2px solid ${i === colorIdx ? 'var(--black)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'transform .2s',
                }}
                onClick={() => setColorIdx(i)}
                title={c.name}
              />
            ))}
          </div>

          {/* SIZE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <p className="pd-section-title" style={{ margin: 0 }}>Size</p>
            <button
              style={{ fontSize: 11, color: 'var(--gray)', border: 'none', background: 'none', letterSpacing: '.08em', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => onToast?.('XS: 44cm — S: 46cm — M: 48cm — L: 50cm — XL: 52cm — XXL: 54cm')}
            >
              Hướng dẫn chọn size
            </button>
          </div>
          <div className="size-grid">
            {product.sizes?.map((s) => {
              const soldOut = product.soldOutSizes?.includes(s)
              return (
                <button
                  key={s}
                  className={`size-btn${selectedSize === s ? ' active' : ''}${soldOut ? ' sold-out' : ''}`}
                  onClick={() => !soldOut && setSelectedSize(s)}
                >
                  {s}
                </button>
              )
            })}
          </div>

          {/* QTY */}
          <p className="pd-section-title">Số lượng</p>
          <div className="qty-row" style={{ marginBottom: '2rem' }}>
            <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <div className="qty-num">{qty}</div>
            <button className="qty-btn" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
          </div>

          <button
            className={`add-to-cart-btn${added ? ' added' : ''}`}
            onClick={handleAddToCart}
            disabled={outOfStock}
            style={{
              background: outOfStock ? '#ccc' : added ? '#2a7a2a' : undefined,
              cursor: outOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {outOfStock ? 'Hết hàng' : added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
          </button>

          <button
            className={`wishlist-btn${isWishlisted ? ' wishlisted' : ''}`}
            onClick={() => {
              toggle(product.id)
              onToast?.(isWishlisted ? 'Đã bỏ yêu thích' : 'Đã lưu yêu thích!')
            }}
          >
            {isWishlisted ? '♥ Đã lưu' : '♡ Lưu yêu thích'}
          </button>

          {/* ACCORDION */}
          <div className="pd-accordion">
            {accordions.map((acc) => (
              <div
                key={acc.key}
                className={`accordion-item${openAccordion === acc.key ? ' open' : ''}`}
              >
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === acc.key ? null : acc.key)}
                >
                  <span>{acc.title}</span>
                  <span className="accordion-icon">+</span>
                </button>
                <div className="accordion-body">{acc.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="products-section" style={{ borderTop: '1px solid var(--border-md)' }}>
          <div className="products-header">
            <div>
              <p className="section-label">Có thể bạn thích</p>
              <h2 className="section-title">Sản phẩm liên quan</h2>
            </div>
          </div>
          <div className="products-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onToast={onToast} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
