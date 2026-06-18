// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuthStore } from '../store/authStore'

export default function Navbar({ onCartOpen, onSearchOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { items } = useCartStore()
  const { ids } = useWishlistStore()
  const { user } = useAuthStore()
  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [lang, setLang] = useState('vi')

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) => location.pathname === path
  const go = (e, path) => { e.preventDefault(); navigate(path) }

  const scrollTo = (e, id) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 250)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const NAV_LINKS = [
    { label: 'Home', href: '/', onClick: (e) => go(e, '/') },
    { label: 'Shop', href: '/shop', onClick: (e) => go(e, '/shop') },
    { label: 'About Us', href: '/#about-section', onClick: (e) => scrollTo(e, 'about-section') },
    { label: 'Contact', href: '/#stores-section', onClick: (e) => scrollTo(e, 'stores-section') },
  ]

  return (
    <>
      <style>{`
        @keyframes mobileSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Base nav layout (desktop default) ── */
        .mf-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px;
          border-bottom: 1px solid #efefef;
          transition: all 0.3s;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 2rem;
          gap: 1rem;
        }
        .mf-logo-wrap {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; user-select: none; justify-self: center;
        }
        .mf-logo-text {
          font-family: var(--font-display, "Barlow Condensed", sans-serif);
          font-weight: 900; font-size: 20px; letter-spacing: 0.16em;
          color: #111; text-transform: uppercase; white-space: nowrap;
        }

        .mf-nav-link {
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; color: #666; font-weight: 500;
          padding: 4px 0; position: relative; transition: color 0.2s;
        }
        .mf-nav-link:hover { color: #111; }
        .mf-nav-link.active { color: #111; font-weight: 700; }
        .mf-nav-link.active::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1px; background: #111;
        }

        .mf-icon-btn, .mf-cart-btn, .mf-lang-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; color: #444; display: flex;
          align-items: center; gap: 5px;
          font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; font-weight: 600;
          transition: color 0.2s; position: relative;
          font-family: inherit;
        }
        .mf-icon-btn:hover, .mf-cart-btn:hover, .mf-lang-btn:hover { color: #111; }
        .mf-lang-btn {
          border: 1px solid #ddd; border-radius: 14px;
          padding: 4px 10px; font-size: 10px;
        }

        .mf-desktop-links { display: flex; gap: 2rem; align-items: center; }
        .mf-desktop-right { display: flex; gap: 0.25rem; align-items: center; justify-content: flex-end; }

        .mf-mobile-hamburger { display: none; }
        .mf-mobile-right { display: none; }

        .mf-mobile-link {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 2rem;
          font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase;
          text-decoration: none; color: #111; font-weight: 700;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s;
        }
        .mf-mobile-link:hover { background: #fafafa; }

        @media (max-width: 768px) {
          .mf-nav {
            grid-template-columns: 1fr;
            justify-content: center;
          }
          .mf-desktop-links { display: none; }
          .mf-desktop-right { display: none; }
          .mf-mobile-hamburger {
            display: flex;
            position: absolute; left: 1rem; top: 50%;
            transform: translateY(-50%);
            background: none; border: none; cursor: pointer;
            padding: 6px; color: #111;
          }
          .mf-mobile-right {
            display: flex;
            position: absolute; right: 1rem; top: 50%;
            transform: translateY(-50%);
            align-items: center; gap: 8px;
          }
        }
      `}</style>

      <nav className="mf-nav" style={{
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      }}>
        <button className="mf-mobile-hamburger" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        <div className="mf-desktop-links">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href} onClick={link.onClick}
              className={`mf-nav-link${isActive(link.href) ? ' active' : ''}`}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="mf-logo-wrap" onClick={() => navigate('/')}>
          <img src="/logo.svg" alt="Midfinger" style={{ height: 28, width: 'auto' }} />
          <span className="mf-logo-text">MIDDLE CHIEVOUS</span>
        </div>

        <div className="mf-desktop-right">
          <button className="mf-icon-btn" onClick={onSearchOpen}>
            <SearchIcon /> Search
          </button>
          <button className="mf-icon-btn" onClick={() => navigate('/account')}>
            <UserIcon /> {user ? user.firstName : 'Account'}
          </button>
          <button className="mf-icon-btn" onClick={() => navigate('/wishlist')} style={{ position: 'relative' }}>
            <HeartIcon />
            Wishlist
            {ids.length > 0 && <Dot>{ids.length}</Dot>}
          </button>
          <button className="mf-cart-btn" onClick={onCartOpen}>
            <CartIcon />
            Cart ({totalItems})
          </button>
          <button className="mf-lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
            {lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </button>
        </div>

        <div className="mf-mobile-right">
          <button className="mf-icon-btn" onClick={onSearchOpen}><SearchIcon /></button>
          <button className="mf-icon-btn" style={{ position: 'relative' }} onClick={onCartOpen}>
            <CartIcon />
            {totalItems > 0 && <Dot>{totalItems}</Dot>}
          </button>
          <button className="mf-lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
            {lang === 'vi' ? '🇻🇳' : '🇬🇧'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', animation: 'fadeIn 0.2s ease' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: '82%', maxWidth: 380,
              background: '#fff',
              display: 'flex', flexDirection: 'column',
              animation: 'mobileSlideIn 0.28s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', height: 56, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '0.14em' }}>MIDDLE CHIEVOUS</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#555' }} onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} onClick={link.onClick} className="mf-mobile-link">
                  <span>{link.label}</span>
                  <span style={{ color: '#ccc', fontSize: 16 }}>→</span>
                </a>
              ))}
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#444', fontFamily: 'inherit' }}
                onClick={() => { navigate('/account'); setMenuOpen(false) }}>
                <UserIcon /> {user ? user.firstName : 'Tài khoản'}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#444', fontFamily: 'inherit' }}
                onClick={() => { navigate('/wishlist'); setMenuOpen(false) }}>
                <HeartIcon /> Yêu thích {ids.length > 0 && `(${ids.length})`}
              </button>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '1.5rem' }}>
              {['Instagram', 'TikTok', 'Facebook'].map(s => (
                <a key={s} href="#" style={{ fontSize: 11, letterSpacing: '0.1em', color: '#999', textDecoration: 'none', textTransform: 'uppercase' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const UserIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const CartIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const HamburgerIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const Dot = ({ children }) => (
  <span style={{
    position: 'absolute', top: 0, right: 0,
    background: '#111', color: '#fff',
    fontSize: 9, fontWeight: 800,
    width: 14, height: 14, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>{children}</span>
)