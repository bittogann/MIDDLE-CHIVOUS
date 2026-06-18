// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useWishlistStore } from './store/wishlistStore'
import { useCartStore } from './store/cartStore'

import Navbar from './components/Navbar'
import CartPanel from './components/CartPanel'
import SearchPanel from './components/SearchPanel'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AccountPage from './pages/AccountPage'
import Wishlist from './pages/Wishlist'
import AdminPage from './pages/AdminPage'
import ReturnPolicy from './pages/ReturnPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import SizeGuide from './pages/SizeGuide'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { toast, showToast } = useToast()
  const location = useLocation()
  const { fetchMe, token, user } = useAuthStore()
const { clear: clearWishlist, setUser } = useWishlistStore()
const { clearCart } = useCartStore()

useEffect(() => {
  window.__mf_logout = () => {
    clearWishlist()
    clearCart()
  }
}, [])

useEffect(() => {
  window.__mf_logout = () => {
    clearWishlist()
    clearCart()
  }
}, [])

  useEffect(() => {
  if (token) fetchMe()
}, [])

useEffect(() => {
  if (token && user?.id) {
    setUser(user.id)
  }
}, [token, user?.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

 const isAdmin = location.pathname === '/admin'

return (
  <>
    {!isAdmin && (
      <Navbar
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchOpen((v) => !v)}
      />
    )}
{!isAdmin && (
  <SearchPanel
    open={searchOpen}
    onClose={() => setSearchOpen(false)}
  />
)}

{!isAdmin && (
  <CartPanel
    open={cartOpen}
    onClose={() => setCartOpen(false)}
  />
)}
      


      <Toast message={toast.message} visible={toast.visible} />

      <div className="page-wrapper">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home onToast={showToast} />} />
          <Route path="/shop" element={<Shop onToast={showToast} />} />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                onToast={showToast}
                onCartOpen={() => setCartOpen(true)}
              />
            }
          />
          <Route path="/checkout" element={<Checkout onToast={showToast} />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/account" element={<AccountPage onToast={showToast} />} />
          <Route path="/wishlist" element={<Wishlist onToast={showToast} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/chinh-sach-doi-tra" element={<ReturnPolicy />} />
          <Route path="/van-chuyen" element={<ShippingPolicy />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 'clamp(60px, 12vw, 120px)',
        color: 'rgba(0,0,0,.06)', lineHeight: 1,
      }}>404</p>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 24, textTransform: 'uppercase',
        letterSpacing: '.08em', marginBottom: '1.5rem',
      }}>Trang không tồn tại</p>
      <a href="/" className="btn-primary" style={{ display: 'inline-block' }}>
        Về trang chủ
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}