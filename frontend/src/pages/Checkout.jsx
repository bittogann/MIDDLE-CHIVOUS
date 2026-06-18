// src/pages/Checkout.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { placeOrder, validateDiscount } from '../utils/api'
import { fmt } from '../utils/format'

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Giao hàng tiêu chuẩn', sub: '2–3 ngày làm việc', fee: 30000, freeOver: 500000 },
  { id: 'express', label: 'Giao hàng nhanh', sub: '1 ngày làm việc', fee: 50000, freeOver: null },
  { id: 'danang', label: 'Nội thành Đà Nẵng', sub: 'Giao trong ngày — chỉ áp dụng nội thành Đà Nẵng', fee: 0, freeOver: null },
]

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { id: 'transfer', label: 'Chuyển khoản ngân hàng' },
  { id: 'momo', label: 'Ví MoMo' },
  { id: 'qr', label: 'Quét mã QR' },
]

export default function Checkout({ onToast }) {
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ lastName: '', firstName: '', email: '', phone: '', addr: '', city: '' })
  const [errors, setErrors] = useState({})
  const [shipping, setShipping] = useState('standard')
  const [payment, setPayment] = useState('cod')
  const [cardNum, setCardNum] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountInfo, setDiscountInfo] = useState(null)
  const [placing, setPlacing] = useState(false)

  const shippingOpt = SHIPPING_OPTIONS.find((o) => o.id === shipping)
  const shippingFee = shippingOpt.freeOver && sub >= shippingOpt.freeOver ? 0 : shippingOpt.fee
  const discountAmt = discountInfo
    ? discountInfo.type === 'percent'
      ? Math.round(sub * discountInfo.value / 100)
      : shippingFee
    : 0
  const total = Math.max(0, sub + shippingFee - discountAmt)

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const REQUIRED = ['lastName', 'firstName', 'addr', 'city']
    const e = {}
    REQUIRED.forEach((k) => { if (!form[k].trim()) e[k] = true })
    if (!form.email.includes('@')) e.email = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goStep = (s) => {
    if (s === 2 && !validate()) { onToast?.('Vui lòng điền đầy đủ thông tin!'); return }
    setStep(s)
    window.scrollTo(0, 0)
  }

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    try {
      const res = await validateDiscount({ code: discountCode, subtotal: sub, shippingFee })
      setDiscountInfo(res.data)
      onToast?.(`✓ ${res.data.desc} — Tiết kiệm ${fmt(res.data.saved)}`)
    } catch (e) {
      setDiscountInfo(null)
      onToast?.(e.response?.data?.message || 'Mã không hợp lệ.')
    }
  }

  const handleOrder = async () => {
    if (payment === 'card' && cardNum.replace(/\s/g, '').length < 16) {
      onToast?.('Số thẻ không hợp lệ!'); return
    }
    setPlacing(true)
    try {
      const res = await placeOrder({
        customer: {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          address: form.addr, city: form.city,
        },
        items: items.map((i) => ({ productId: i.productId, size: i.size, colorHex: i.colorHex, qty: i.qty })),
        shippingMethod: shipping,
        discountCode: discountCode.trim() || null,
        paymentMethod: payment,
      })
      clearCart()
      navigate(`/order-success?order=${res.data.order.orderNumber}&email=${form.email}`)
    } catch (err) {
      const msg = err.response?.data?.message
      onToast?.(msg || 'Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
      setPlacing(false)
    }
  }

  if (!items.length) return (
    <div style={{ padding: '6rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Giỏ hàng trống</p>
      <button className="btn-primary" onClick={() => navigate('/shop')}>Mua sắm ngay</button>
    </div>
  )

  // ── Order summary (shown on all steps) ────────────────────────────────
  const Summary = () => (
    <div className="checkout-summary">
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '1.5rem' }}>
        Đơn hàng ({items.length} sản phẩm)
      </h3>
      {items.map((item) => (
        <div key={item.key} className="order-summary-item">
          <div>
            <div className="order-summary-name">{item.name} ×{item.qty}</div>
            <div className="order-summary-variant">Size: {item.size} · {item.colorName}</div>
          </div>
          <div>{fmt(item.price * item.qty)}</div>
        </div>
      ))}

      <div style={{ borderTop: '1px solid var(--border-md)', paddingTop: '1rem', marginTop: '1rem' }}>
        <div className="order-summary-item"><span>Tạm tính</span><span>{fmt(sub)}</span></div>
        <div className="order-summary-item">
          <span>Vận chuyển</span>
          <span>{shippingFee === 0 ? '🎉 Miễn phí' : fmt(shippingFee)}</span>
        </div>
        {discountAmt > 0 && (
          <div className="order-summary-item" style={{ color: '#2a7a2a' }}>
            <span>Giảm giá ({discountCode})</span>
            <span>−{fmt(discountAmt)}</span>
          </div>
        )}
        <div className="order-summary-item" style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)', borderTop: '1px solid var(--border-md)', paddingTop: '.75rem', marginTop: '.5rem' }}>
          <span>Tổng cộng</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      {step >= 2 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="Mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
            />
            <button className="btn-primary" style={{ padding: '11px 16px', fontSize: 11 }} onClick={applyDiscount}>
              Áp dụng
            </button>
          </div>
          {discountInfo && (
            <p style={{ fontSize: 12, color: '#2a7a2a', marginTop: 6 }}>✓ {discountInfo.desc}</p>
          )}
          <p style={{ fontSize: 11, color: 'var(--gray)', marginTop: 8 }}>
            Thử: MIDFINGER10 · FREESHIP · NEWKID20
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="checkout-page">
      {/* Steps */}
      <div className="checkout-steps">
        {['Thông tin', 'Vận chuyển', 'Thanh toán'].map((label, i) => (
          <span key={label} className={`step-dot${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">

          {/* ── STEP 1: Info ── */}
          {step === 1 && (
            <>
              <h2 className="checkout-section-title">Thông tin giao hàng</h2>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                {[
                  { id: 'lastName', label: 'Họ', ph: 'Nguyễn' },
                  { id: 'firstName', label: 'Tên', ph: 'Văn A' },
                ].map(({ id, label, ph }) => (
                  <div key={id} className="form-group">
                    <label>{label}</label>
                    <input className={`form-input${errors[id] ? ' error' : ''}`}
                      placeholder={ph} value={form[id]} onChange={(e) => setF(id, e.target.value)} />
                  </div>
                ))}
              </div>
              {[
                { id: 'email', label: 'Email', ph: 'email@example.com', type: 'email' },
                { id: 'phone', label: 'Số điện thoại', ph: '0901 234 567', type: 'tel' },
                { id: 'addr', label: 'Địa chỉ', ph: 'Số nhà, tên đường' },
                { id: 'city', label: 'Thành phố', ph: 'Điền thành phố' },
              ].map(({ id, label, ph, type }) => (
                <div key={id} className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>{label}</label>
                  <input className={`form-input${errors[id] ? ' error' : ''}`}
                    type={type || 'text'} placeholder={ph}
                    value={form[id]} onChange={(e) => setF(id, e.target.value)} />
                </div>
              ))}
              
              <button className="btn-primary" style={{ width: '100%', padding: 16, marginTop: '1rem' }}
                onClick={() => goStep(2)}>
                Tiếp theo: Vận chuyển →
              </button>
            </>
          )}

          {/* ── STEP 2: Shipping ── */}
          {step === 2 && (
            <>
              <h2 className="checkout-section-title">Phương thức vận chuyển</h2>
              {SHIPPING_OPTIONS.map((opt) => {
                const free = opt.freeOver && sub >= opt.freeOver
                return (
                  <div key={opt.id}
                    className={`payment-option${shipping === opt.id ? ' active' : ''}`}
                    onClick={() => setShipping(opt.id)}>
                    <input type="radio" checked={shipping === opt.id} readOnly style={{ marginRight: 12 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray)' }}>{opt.sub}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: free ? '#2a7a2a' : undefined }}>
                      {free ? '🎉 Miễn phí' : fmt(opt.fee)}
                    </div>
                  </div>
                )
              })}
              {sub < 500000 && (
                <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: '1.5rem' }}>
                  Mua thêm {fmt(500000 - sub)} để được miễn phí vận chuyển tiêu chuẩn.
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={() => goStep(3)}>Tiếp theo: Thanh toán →</button>
              </div>
            </>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <>
              <h2 className="checkout-section-title">Phương thức thanh toán</h2>
              {PAYMENT_OPTIONS.map((opt) => (
                <div key={opt.id}
                  className={`payment-option${payment === opt.id ? ' active' : ''}`}
                  onClick={() => setPayment(opt.id)}>
                  <input type="radio" checked={payment === opt.id} readOnly style={{ marginRight: 12 }} />
                  <span style={{ fontWeight: 500 }}>{opt.label}</span>
                </div>
              ))}
              {payment === 'transfer' && (
                <div style={{ background: 'var(--off)', padding: '1rem 1.25rem', marginTop: '1rem', fontSize: 13, lineHeight: 1.8 }}>
                  <strong>Thông tin chuyển khoản:</strong><br />
                  Ngân hàng: Vietcombank<br />
                  STK: 1021630172<br />
                  Tên: DANG BAO HUY<br />
                  Nội dung: Thanh toán áo<br />
                  <em style={{ fontSize: 12, color: '#888' }}>Vui lòng chuyển đúng số tiền và ghi nội dung để xử lý đơn nhanh hơn.</em>
                </div>
              )}
              {payment === 'qr' && (
                <div style={{ background: 'var(--off)', padding: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, marginBottom: '1rem' }}>
                    <strong>Quét mã để chuyển khoản:</strong><br />
                    Nội dung: MID-{Date.now().toString().slice(-6)}
                  </p>
                  <img
                    src="/qr-vietcombank.jpg"
                    alt="QR thanh toán"
                    style={{ width: '100%', maxWidth: 320, height: 'auto', background: '#fff', border: '1px solid var(--border-md)', borderRadius: 8, margin: '0 auto' }}
                  />
                  <p style={{ fontSize: 12, color: '#888', marginTop: '1rem' }}>
                    Vui lòng chuyển đúng số tiền và ghi nội dung để xử lý đơn nhanh hơn.
                  </p>
                </div>
              )}
              {payment === 'momo' && (
                <div style={{ background: 'var(--off)', padding: '1rem 1.25rem', marginTop: '1rem', fontSize: 13, lineHeight: 1.8 }}>
                  <strong>Thông tin chuyển MoMo:</strong><br />
                  Số điện thoại: 0775.497.421<br />
                  Tên: DANG BAO HUY<br />
                  Nội dung: Thanh toán áo<br />
                  <em style={{ fontSize: 12, color: '#888' }}>Vui lòng chuyển đúng số tiền và ghi nội dung để xử lý đơn nhanh hơn.</em>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={handleOrder} disabled={placing}>
                  {placing ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
                </button>
              </div>
            </>
          )}
        </div>

        <Summary />
      </div>
    </div>
  )
}
