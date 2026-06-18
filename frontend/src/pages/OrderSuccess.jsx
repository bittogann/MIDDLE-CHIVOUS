// src/pages/OrderSuccess.jsx
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const orderNum = params.get('order')
  const email = params.get('email')

  return (
    <div className="success-page">
      <div className="success-icon">✓</div>
      <h1 className="success-title">Đặt hàng thành công!</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: '.5rem' }}>
        Mã đơn hàng: <strong>{orderNum}</strong>
      </p>
      <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem' }}>
        Xác nhận đơn hàng sẽ được gửi đến <strong>{email}</strong>
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={() => navigate('/account')}>
          Xem đơn hàng
        </button>
        <button className="btn-primary" onClick={() => navigate('/shop')}>
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  )
}
