// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProducts, subscribeNewsletter } from '../utils/api'
import STATIC_PRODUCTS from '../data/staticProducts'
import { fmt } from '../utils/format'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'

function useCountdown(target) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0')
  const d = diff / 86400000
  const h = (diff % 86400000) / 3600000
  const m = (diff % 3600000) / 60000
  const s = (diff % 60000) / 1000
  return { days: pad(d), hours: pad(h), mins: pad(m), secs: pad(s) }
}

export default function Home({ onToast }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState(STATIC_PRODUCTS.filter((p) => p.isNew).slice(0, 4))
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState(null)
  const [settings, setSettings] = useState(null)
  const [stores, setStores] = useState([])

  // Fetch homepage config, settings, stores
  useEffect(() => {
    fetch(`${BASE}/api/homepage`).then(r => r.json()).then(setHp).catch(() => {})
    fetch(`${BASE}/api/settings`).then(r => r.json()).then(setSettings).catch(() => {})
    fetch(`${BASE}/api/stores`).then(r => r.json()).then(d => Array.isArray(d) && setStores(d)).catch(() => {})
  }, [])

  // Fetch products
  useEffect(() => {
    getProducts({ sort: 'newest', limit: 4 })
      .then((res) => setProducts(res.data.products))
      .catch(() => {})
  }, [])

  const countdownTarget = hp?.countdown?.targetDate
    ? new Date(hp.countdown.targetDate).getTime()
    : Date.now() + (4 * 24 * 3600 + 8 * 3600 + 45 * 60) * 1000
  const { days, hours, mins, secs } = useCountdown(countdownTarget)

  const handleSubscribe = async () => {
    if (!email.includes('@')) { onToast?.('Email không hợp lệ!'); return }
    try {
      await subscribeNewsletter(email)
      setEmail('')
      onToast?.('Đăng ký thành công!')
    } catch (e) {
      onToast?.(e.response?.data?.message || 'Đã có lỗi xảy ra.')
    }
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Hero data
  const hero = hp?.hero
  const heroMedia = () => {
    if (!hero) return null
    if (hero.mediaType === 'video' && hero.video)
      return <video src={`${BASE}${hero.video}`} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
    if (hero.mediaType === 'image' && hero.image)
      return <img src={`${BASE}${hero.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} alt="" />
    return (
      <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
        <rect x="60" y="40" width="200" height="260" stroke="rgba(0,0,0,.1)" strokeWidth="1"/>
        <rect x="80" y="60" width="160" height="220" fill="rgba(0,0,0,.02)"/>
        <circle cx="160" cy="170" r="60" stroke="rgba(0,0,0,.07)" strokeWidth="1"/>
        <circle cx="160" cy="170" r="30" stroke="rgba(0,0,0,.05)" strokeWidth=".5"/>
        <text x="160" y="178" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="900" fontSize="16" fill="rgba(0,0,0,.35)" letterSpacing="4">MID</text>
        <rect x="100" y="330" width="120" height="40" fill="rgba(0,0,0,.04)" stroke="rgba(0,0,0,.1)" strokeWidth=".5"/>
        <text x="160" y="355" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700" fontSize="12" fill="rgba(0,0,0,.3)" letterSpacing="6">FINGER</text>
      </svg>
    )
  }

  // Ticker
  const tickerItems = hp?.ticker?.items || ['FREE SHIP ĐƠN TỪ 500K', 'NEW DROP: SS25 "BIG KIDS"', 'ĐÀ NẴNG', 'IF WE VIBE, WE VIBE']
  const showTicker = hp?.ticker?.enabled !== false

  // Marquee
  const marqueeRow1 = hp?.marquee?.row1 || ['IF WE VIBE, WE VIBE', 'STREETWEAR VIETNAM']
  const marqueeRow2 = hp?.marquee?.row2 || ['ART — HIP-HOP — FASHION', 'SINCE 2020']
  const showMarquee = hp?.marquee?.enabled !== false

  // About
  const about = hp?.about || {}
  const aboutStats = about.stats || [
    { num: '2020', label: 'Thành lập' },
    { num: '2 Stores', label: 'HCMC' },
    { num: '50+', label: 'Thiết kế mỗi năm' },
    { num: '10K+', label: 'Khách hàng' },
  ]

  // Countdown
  const countdown = hp?.countdown || {}
  const showCountdown = countdown.enabled !== false

  // Banner
  const banner = hp?.banner || {}
  const showBanner = banner.enabled === true

  // Footer
  const brandName = settings?.brandName || 'MIDFINGER'
  const footerDesc = settings?.footerDesc || 'Streetwear brand sinh ra từ đường phố Sài Gòn. EST. 2020.'
  const social = settings?.social || {}

  return (
    <>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{hero?.eyebrow || 'SS25 Collection — The Big Kids'}</p>
          <h1 className="hero-title">
            {hero?.title
              ? hero.title.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))
              : <>WE ARE<br />ALL<br />THE <span className="stroke">BIG</span><br />KIDS</>
            }
          </h1>
          <p className="hero-sub">{hero?.subtitle || 'Trong mỗi chúng ta luôn tồn tại một đứa trẻ tự do, tràn đầy năng lượng. MIDFINGER là nơi đánh thức và nuôi dưỡng tinh thần ấy.'}</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => navigate('/shop')}>{hero?.btnPrimary || 'Shop Now'}</button>
            <button className="btn-secondary" onClick={() => scrollTo('drop-section')}>{hero?.btnSecondary || 'Xem New Drop'}</button>
          </div>
        </div>
        <div className="hero-right" style={{ position: 'relative', overflow: 'hidden' }}>
  <div className="hero-bg-text">BIG<br />KIDS</div>
  <div className="hero-badge" onClick={() => navigate('/shop')}>
    <span className="big">EST</span>
    <span>2024</span>
    <span>DNC VN</span>
  </div>

  {hero?.mediaType === 'image' && hero?.image && (
    <img
      src={`${BASE}${hero.image}`}
      alt="hero"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 1,
        borderRadius: 8
      }}
    />
  )}
  {hero?.mediaType === 'video' && hero?.video && (
    <video
      src={`${BASE}${hero.video}`}
      autoPlay muted loop playsInline
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 1,
        borderRadius: 8
      }}
    />
  )}
  {(!hero?.mediaType || hero?.mediaType === 'default') && (
    <svg width="320" height="420" viewBox="0 0 320 420" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
      <rect x="60" y="40" width="200" height="260" stroke="rgba(0,0,0,.1)" strokeWidth="1"/>
      <rect x="80" y="60" width="160" height="220" fill="rgba(0,0,0,.02)"/>
      <circle cx="160" cy="170" r="60" stroke="rgba(0,0,0,.07)" strokeWidth="1"/>
      <circle cx="160" cy="170" r="30" stroke="rgba(0,0,0,.05)" strokeWidth=".5"/>
      <text x="160" y="178" textAnchor="middle" fontFamily="Barlow Condensed"
        fontWeight="900" fontSize="16" fill="rgba(0,0,0,.35)" letterSpacing="4">MID</text>
      <rect x="100" y="330" width="120" height="40" fill="rgba(0,0,0,.04)"
        stroke="rgba(0,0,0,.1)" strokeWidth=".5"/>
      <text x="160" y="355" textAnchor="middle" fontFamily="Barlow Condensed"
        fontWeight="700" fontSize="12" fill="rgba(0,0,0,.3)" letterSpacing="6">FINGER</text>
    </svg>
  )}
</div>
      </section>

      {/* CATEGORIES */}
      <div className="categories">
        {[
          { num: '01', name: 'Áo Tee & Crop', desc: 'Đơn giản, cá tính, phù hợp mọi outfit đường phố.', cat: 'Tee' },
          { num: '02', name: 'Hoodie & Jacket', desc: 'Chất liệu premium, form rộng — vibe underground thuần túy.', cat: 'Hoodie' },
          { num: '03', name: 'Quần & Phụ kiện', desc: 'Cargo, jeans, cap, tote — complete the look.', cat: 'Pants' },
        ].map(({ num, name, desc, cat }) => (
          <div key={cat} className="cat-item" onClick={() => navigate(`/shop?category=${cat}`)}>
            <div className="cat-num">{num}</div>
            <div className="cat-name">{name}</div>
            <div className="cat-desc">{desc}</div>
            <span className="cat-arrow">↗</span>
          </div>
        ))}
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <div className="products-header">
          <div>
            <p className="section-label">New Arrivals</p>
            <h2 className="section-title">Sản phẩm mới</h2>
          </div>
          <button className="see-all-btn" onClick={() => navigate('/shop')}>Xem tất cả →</button>
        </div>
        <div className="products-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} onToast={onToast} />)}
        </div>
      </section>

      {/* MARQUEE */}
      {showMarquee && (
        <div className="marquee-section">
          <div className="marquee-row">
            <div className="marquee-track">
              {[0, 1].map((i) => (
                <span key={i}>
                  {marqueeRow1.map((item, j) => (
                    <span key={j}>{item}<span style={{ margin: '0 2rem' }}>★</span></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
          <div className="marquee-row">
            <div className="marquee-track marquee-track-rev">
              {[0, 1].map((i) => (
                <span key={i}>
                  {marqueeRow2.map((item, j) => (
                    <span key={j}><span className="outline">{item}</span><span style={{ margin: '0 2rem' }}>✦</span></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANNER (nếu được bật) */}
      {showBanner && (
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
          {banner.mediaType === 'video' && banner.video && (
            <video src={`${BASE}${banner.video}`} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
          )}
          {banner.mediaType === 'image' && banner.image && (
            <img src={`${BASE}${banner.image}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="" />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px,5vw,52px)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{banner.title}</h2>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: '1.5rem' }}>{banner.subtitle}</p>
            <button className="btn-primary" style={{ background: '#fff', color: '#111' }} onClick={() => navigate(banner.btnLink || '/shop')}>{banner.btnText || 'Xem ngay'}</button>
          </div>
        </section>
      )}

      {/* DROP COUNTDOWN */}
      {showCountdown && (
        <section className="drop-section" id="drop-section">
          <div className="drop-info">
            <span className="drop-tag">Coming Soon</span>
            <h2 className="drop-title">
              {countdown.title
                ? countdown.title.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))
                : <>SS25<br />"BIG KIDS"<br />Collection</>
              }
            </h2>
            <p className="drop-desc">{countdown.desc || 'Bộ sưu tập mùa hè 2025 — lấy cảm hứng từ tinh thần tự do không giới hạn.'}</p>
            <div className="countdown">
              {[{ val: days, label: 'Ngày' }, { val: hours, label: 'Giờ' }, { val: mins, label: 'Phút' }, { val: secs, label: 'Giây' }].map(({ val, label }) => (
                <div key={label} className="countdown-item">
                  <span className="countdown-num">{val}</span>
                  <span className="countdown-label">{label}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: '2rem', background: 'white', color: 'black' }}
              onClick={() => onToast?.('Cảm ơn! Chúng tôi sẽ thông báo khi drop ra mắt.')}>
              Thông báo khi ra mắt
            </button>
          </div>
          <div className="drop-visual">
            <div className="drop-bg-num">SS<br />25</div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-md)' }}>
        <div style={{ padding: '5rem 4rem', borderRight: '1px solid var(--border-md)' }}>
          <p className="section-label">{about.eyebrow || 'Về chúng tôi'}</p>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            {about.title
              ? about.title.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))
              : <>Born in<br />Saigon.</>
            }
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#666', maxWidth: 380, marginBottom: '2rem' }}>
            {about.desc || 'MIDFINGER ra đời năm 2020 từ tình yêu với văn hoá hip-hop, skateboarding và nghệ thuật đường phố Sài Gòn.'}
          </p>
          <button className="btn-secondary" onClick={() => navigate('/shop')}>Khám phá Collection</button>
        </div>
        <div style={{ padding: '5rem 4rem', background: 'var(--off)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {aboutStats.map(({ num, label }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', textTransform: 'uppercase' }}>{num}</span>
              <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STORES */}
      <section id="stores-section" style={{ padding: '4rem 2.5rem', borderBottom: '1px solid var(--border-md)' }}>
        <p className="section-label">Cửa hàng</p>
        <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Tìm chúng tôi</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-md)' }}>
          {(stores.length > 0 ? stores : [
            { id: 1, name: 'MIDFINGER — THỦ ĐỨC', addr: '39B Nguyễn Duy Hiệu, P. Thảo Điền, Tp. Thủ Đức', hours: 'T2–T7: 10:00 – 21:00 · CN: 11:00 – 20:00' },
            { id: 2, name: 'MIDFINGER — Q.1', addr: '214 Hai Bà Trưng, P. Đa Kao, Quận 1, HCMC', hours: 'T2–CN: 10:00 – 21:30' },
          ]).map((store) => (
            <div key={store.id} style={{ background: 'var(--white)', padding: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.75rem' }}>{store.name}</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: '.5rem' }}>{store.addr}</p>
              <p style={{ fontSize: 12, color: 'var(--gray)', letterSpacing: '.04em' }}>{store.hours}</p>
              {store.mapUrl && <a href={store.mapUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#111', textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>Xem bản đồ →</a>}
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-section">
        <p className="section-label" style={{ color: '#aaa' }}>Stay Updated</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px,4vw,44px)', textTransform: 'uppercase', color: 'white', marginBottom: '1rem' }}>
          Đăng ký nhận tin
        </h2>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: '2rem' }}>
          Drop mới nhất, lookbook, khuyến mãi độc quyền — thẳng vào inbox của bạn.
        </p>
        <div className="newsletter-form">
          <input className="newsletter-input" placeholder="Email của bạn" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()} />
          <button className="newsletter-btn" onClick={handleSubscribe}>Đăng ký</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">{brandName}</div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, maxWidth: 260 }}>{footerDesc}</p>
          </div>
          {[
            { title: 'Shop', links: ['Áo Tee', 'Hoodie', 'Quần & Phụ kiện', 'Sale'] },
            { title: 'Info', links: ['Về chúng tôi', 'Stores', 'Careers', 'Press'] },
            { title: 'Support', links: [
              { label: 'Chính sách đổi trả', href: '/chinh-sach-doi-tra' },
              { label: 'Vận chuyển', href: '/van-chuyen' },
              { label: 'Size Guide', href: '/size-guide' },
              { label: 'Liên hệ', href: '/contact' },
            ]},
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1rem', color: '#ccc' }}>{title}</h4>
              {links.map((l) => (
                typeof l === 'string'
                  ? <a key={l} href="#" style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: '.5rem', textDecoration: 'none' }}>{l}</a>
                  : <a key={l.label} href={l.href} style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: '.5rem', textDecoration: 'none' }}>{l.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {settings?.estYear || '2025'} {brandName}. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { label: 'Instagram', url: social.instagram },
              { label: 'TikTok', url: social.tiktok },
              { label: 'Facebook', url: social.facebook },
            ].map(({ label, url }) => (
              <a key={label} href={url || '#'} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, letterSpacing: '.1em', color: '#555' }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}