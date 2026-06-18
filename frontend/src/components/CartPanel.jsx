// src/components/CartPanel.jsx
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import ProductSVG from './ProductSVG'
import { fmt } from '../utils/format'
import STATIC_PRODUCTS from '../data/staticProducts'

export default function CartPanel({ open, onClose }) {
  const navigate = useNavigate()
  const { items, removeItem, changeQty } = useCartStore()
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  const getProduct = (id) => STATIC_PRODUCTS.find((p) => p.id === id)

  const goCheckout = () => {
    if (!items.length) return
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      <div className={`overlay${open ? ' active' : ''}`} onClick={onClose} style={{ zIndex: 290 }} />
      <div className={`cart-panel${open ? ' open' : ''}`}>
        <div className="cart-header">
          <span className="cart-title">
            Giỏ hàng{' '}
            {totalQty > 0 && (
              <span style={{ opacity: 0.5, fontSize: 16 }}>({totalQty})</span>
            )}
          </span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-body">
          {!items.length ? (
            <div className="cart-empty">
              Giỏ hàng trống
              <br /><br />
              <button
                className="btn-primary"
                onClick={() => { onClose(); navigate('/shop') }}
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = getProduct(item.productId)
              return (
                <div key={item.key} className="cart-item">
                  <div className="cart-item-img">
                    {product && <ProductSVG product={product} colorIdx={item.colorIdx} size="thumb" />}
                  </div>
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-variant">
                      Size: {item.size} · {item.colorName}
                    </div>
                    <div className="cart-item-row">
                      <div className="cart-qty">
                        <button className="cart-qty-btn" onClick={() => changeQty(item.key, -1)}>−</button>
                        <div className="cart-qty-num">{item.qty}</div>
                        <button className="cart-qty-btn" onClick={() => changeQty(item.key, 1)}>+</button>
                      </div>
                      <div className="cart-item-price">{fmt(item.price * item.qty)}</div>
                      <button className="remove-item-btn" onClick={() => removeItem(item.key)}>✕</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-subtotal">
            <span>Tạm tính</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="cart-subtotal" style={{ fontSize: 12, color: 'var(--gray)' }}>
            <span>Phí vận chuyển</span>
            <span>{subtotal >= 500000 ? 'Miễn phí' : 'Tính khi thanh toán'}</span>
          </div>
          <div className="cart-subtotal-total">
            <span>Tổng</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <button className="checkout-btn" onClick={goCheckout}>Thanh toán ngay</button>
          <button className="continue-btn" onClick={onClose}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </>
  )
}
