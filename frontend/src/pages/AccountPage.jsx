// src/pages/AccountPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getMyOrders } from '../utils/api'
import { fmt, getStatusLabel, getStatusClass } from '../utils/format'

export default function AccountPage({ onToast }) {
  const { user, token, login, register, logout, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [section, setSection] = useState('orders')
  const [orders, setOrders] = useState([])
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', addr: '', city: '' })

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        addr: user.address?.addr || '',
        city: user.address?.city || '',
      })
    }
  }, [user])

  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = () => {
    if (user && token) {
      getMyOrders()
        .then((res) => {
          setOrders(res.data.orders)
          // Cập nhật selectedOrder nếu đang xem
          if (selectedOrder) {
            const updated = res.data.orders.find(o => o.orderNumber === selectedOrder.orderNumber)
            if (updated) setSelectedOrder(updated)
          }
        })
        .catch(() => {})
    }
  }

  useEffect(() => {
    fetchOrders()
    // Polling mỗi 30 giây
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [user, token])

  const handleAuth = async () => {
    if (!form.email || !form.password) { onToast?.('Vui lòng điền đầy đủ!'); return }
    setLoading(true)
    try {
      if (authMode === 'login') {
        const data = await login(form.email, form.password)
        onToast?.('Đăng nhập thành công!')
        if (data.user?.role === 'admin') {
          navigate('/admin')
          return
        }
      } else {
        if (!form.firstName || !form.lastName) { onToast?.('Vui lòng điền họ và tên!'); setLoading(false); return }
        await register(form)
        onToast?.('Đăng ký thành công!')
      }
    } catch (e) {
      onToast?.(e.response?.data?.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setPF = (key, val) => setProfileForm((f) => ({ ...f, [key]: val }))
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      })
      onToast?.('Đã lưu thông tin!')
    } catch (e) {
      onToast?.(e.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    try {
      await updateProfile({
        address: { addr: profileForm.addr, city: profileForm.city },
      })
      onToast?.('Đã lưu địa chỉ!')
    } catch (e) {
      onToast?.(e.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSavingAddress(false)
    }
  }
  // ── Auth screen ────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ maxWidth: 440, margin: '5rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 38, textTransform: 'uppercase', marginBottom: '2.5rem' }}>
        {authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </h1>

      {authMode === 'register' && (
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Họ</label>
            <input className="form-input" placeholder="Nguyễn" value={form.lastName} onChange={(e) => setF('lastName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tên</label>
            <input className="form-input" placeholder="Văn A" value={form.firstName} onChange={(e) => setF('firstName', e.target.value)} />
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label>Email</label>
        <input className="form-input" type="email" placeholder="email@example.com"
          value={form.email} onChange={(e) => setF('email', e.target.value)} />
      </div>
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label>Mật khẩu</label>
        <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự"
          value={form.password} onChange={(e) => setF('password', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
      </div>

      <button className="btn-primary" style={{ width: '100%', padding: 15 }} onClick={handleAuth} disabled={loading}>
        {loading ? 'Đang xử lý...' : authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </button>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--gray)' }}>
        {authMode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
        <button style={{ background: 'none', border: 'none', color: 'var(--black)', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
          {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
        </button>
      </p>
    </div>
  )

  // ── Logged-in screen ───────────────────────────────────────────────────
  const NAV = [
    { id: 'orders', label: 'Đơn hàng của tôi' },
    { id: 'profile', label: 'Thông tin cá nhân' },
    { id: 'address', label: 'Địa chỉ giao hàng' },
  ]

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-avatar">{(user.firstName?.[0] || 'U').toUpperCase()}</div>
        <div className="account-name">{user.firstName} {user.lastName}</div>
        <div className="account-email">{user.email}</div>

        {NAV.map((nav) => (
          <button key={nav.id}
            className={`account-nav-item${section === nav.id ? ' active' : ''}`}
            onClick={() => setSection(nav.id)}>
            {nav.label}
          </button>
        ))}

        <button className="account-nav-item"
          style={{ color: '#d44', marginTop: '2rem', borderBottom: 'none' }}
          onClick={() => { logout(); onToast?.('Đã đăng xuất.') }}>
          Đăng xuất
        </button>
      </aside>

      <div className="account-content">
        {/* ORDERS */}
        {section === 'orders' && (
          <>
            <h2 className="account-title">
              {selectedOrder ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setSelectedOrder(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
                  Đơn hàng #{selectedOrder.orderNumber}
                </span>
              ) : 'Đơn hàng của tôi'}
            </h2>

            {!selectedOrder && (
              <>
                {orders.length === 0 ? (
                  <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--gray)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    Chưa có đơn hàng nào
                    <br /><br />
                    <button className="btn-primary" onClick={() => navigate('/shop')}>Mua sắm ngay</button>
                  </div>
                ) : orders.map((o) => (
                  <div key={o.orderNumber} className="order-card"
                    onClick={() => setSelectedOrder(o)}
                    style={{ cursor: 'pointer', transition: 'box-shadow .2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div className="order-card-header">
                      <div>
                        <div className="order-id">#{o.orderNumber}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>
                          {new Date(o.createdAt).toLocaleDateString('vi-VN')} · {o.items.length} sản phẩm
                        </div>
                      </div>
                      <span className={`order-status ${getStatusClass(o.status)}`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div style={{ fontSize: 13, color: 'var(--gray)' }}>
                        {o.items.map((i) => i.name).join(', ')}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{fmt(o.total)}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'right' }}>
                      Nhấn để xem chi tiết →
                    </div>
                  </div>
                ))}
              </>
            )}

            {selectedOrder && (() => {
              const o = selectedOrder
              const TIMELINE = [
                { key: 'processing', label: 'Đã đặt hàng', icon: '📦' },
                { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
                { key: 'shipping', label: 'Đang giao hàng', icon: '🚚' },
                { key: 'delivered', label: 'Đã giao hàng', icon: '🎉' },
              ]
              const currentIdx = TIMELINE.findIndex(t => t.key === o.status)
              return (
                <div>
                  {o.status !== 'cancelled' ? (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', overflowX: 'auto', paddingBottom: 8 }}>
                      {TIMELINE.map((t, i) => (
                        <div key={t.key} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: i <= currentIdx ? 'var(--black)' : '#f0f0f0',
                              color: i <= currentIdx ? '#fff' : '#aaa',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18, transition: 'all .3s'
                            }}>
                              {t.icon}
                            </div>
                            <span style={{ fontSize: 11, textAlign: 'center', color: i <= currentIdx ? 'var(--black)' : '#aaa', fontWeight: i === currentIdx ? 700 : 400 }}>
                              {t.label}
                            </span>
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--black)' : '#f0f0f0', margin: '0 4px', marginBottom: 24, transition: 'all .3s' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600 }}>
                      ❌ Đơn hàng đã bị huỷ
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div style={{ border: '1px solid var(--border-md)', borderRadius: 8, padding: '1.25rem' }}>
                      <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Thông tin giao hàng</div>
                      <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                        <strong>{o.customer?.firstName} {o.customer?.lastName}</strong><br />
                        {o.customer?.phone}<br />
                        {o.customer?.address}{o.customer?.city ? ', ' + o.customer?.city : ''}
                      </div>
                    </div>
                    <div style={{ border: '1px solid var(--border-md)', borderRadius: 8, padding: '1.25rem' }}>
                      <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Thanh toán & Vận chuyển</div>
                      <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                        {o.paymentMethod === 'cod' ? '💵 COD' : o.paymentMethod === 'transfer' ? '🏦 Chuyển khoản' : o.paymentMethod}<br />
                        {o.shippingMethod === 'standard' ? '📦 Tiêu chuẩn' : o.shippingMethod === 'express' ? '⚡ Nhanh' : '🏃 Trong ngày'}
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border-md)', borderRadius: 8, padding: '1.25rem', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>Sản phẩm</div>
                    {o.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < o.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Size: {item.size} · x{item.qty}</div>
                        </div>
                        <div style={{ fontWeight: 600 }}>{fmt(item.lineTotal || item.unitPrice * item.qty)}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 4 }}>
                        <span>Tạm tính</span><span>{fmt(o.subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 4 }}>
                        <span>Phí vận chuyển</span><span>{o.shippingFee === 0 ? 'Miễn phí' : fmt(o.shippingFee)}</span>
                      </div>
                      {o.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981', marginBottom: 4 }}>
                          <span>Giảm giá</span><span>-{fmt(o.discount)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '2px solid #111' }}>
                        <span>Tổng cộng</span><span>{fmt(o.total)}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={fetchOrders}
                    style={{ background: 'none', border: '1px solid var(--border-md)', padding: '8px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 4, color: '#666' }}>
                    🔄 Cập nhật trạng thái
                  </button>
                </div>
              )
            })()}
          </>
        )}

        {/* PROFILE */}
        {section === 'profile' && (
          <>
            <h2 className="account-title">Thông tin cá nhân</h2>
            <div className="form-grid" style={{ maxWidth: 500, marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Họ</label>
                <input className="form-input" value={profileForm.lastName} onChange={(e) => setPF('lastName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tên</label>
                <input className="form-input" value={profileForm.firstName} onChange={(e) => setPF('firstName', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 500, marginBottom: '1rem' }}>
              <label>Email</label>
              <input className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group" style={{ maxWidth: 500, marginBottom: '1.5rem' }}>
              <label>Số điện thoại</label>
              <input className="form-input" placeholder="0901 234 567"
                value={profileForm.phone} onChange={(e) => setPF('phone', e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </>
        )}

        {/* ADDRESS */}
        {section === 'address' && (
          <>
            <h2 className="account-title">Địa chỉ giao hàng</h2>
            <div className="form-group" style={{ maxWidth: 500, marginBottom: '1rem' }}>
              <label>Địa chỉ</label>
              <input className="form-input" placeholder="Số nhà, tên đường"
                value={profileForm.addr} onChange={(e) => setPF('addr', e.target.value)} />
            </div>
            <div className="form-grid" style={{ maxWidth: 500, marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Quận / Huyện</label>
                <input className="form-input" placeholder="Quận 1" />
              </div>
              <div className="form-group">
                <label>Thành phố</label>
                <input className="form-input" placeholder="Hồ Chí Minh"
                  value={profileForm.city} onChange={(e) => setPF('city', e.target.value)} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleSaveAddress} disabled={savingAddress}>
              {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
