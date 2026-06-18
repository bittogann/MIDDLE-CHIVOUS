// src/pages/AdminPage.jsx — Full Admin Panel
import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'
const TOKEN_KEY = 'mf_admin_token'

function af(path, opts = {}) {
  const adminToken = localStorage.getItem(TOKEN_KEY)
  const authToken = localStorage.getItem('mf_token')
  return fetch(`${API}/admin${path}`, {
    ...opts,
    headers: {
      'x-admin-token': adminToken || '',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      ...(opts.headers || {})
    }
  })
}

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('vi-VN')
const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']
const STATUS_LABELS = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã huỷ' }
const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', shipping: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' }

// ── Login ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const handle = async () => {
    const r = await fetch(`${API}/admin/products`, { headers: { 'x-admin-token': pw } })
    if (r.ok) { localStorage.setItem(TOKEN_KEY, pw); onLogin(pw) }
    else setErr('Sai mật khẩu')
  }
  return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <p style={S.loginLogo}>MIDFINGER</p>
        <p style={S.loginSub}>ADMIN PANEL</p>
        <input type="password" placeholder="Mật khẩu admin" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} style={S.input} />
        {err && <p style={{ color: '#ef4444', fontSize: 13, margin: '4px 0' }}>{err}</p>}
        <button onClick={handle} style={S.btnPrimary}>Đăng nhập</button>
      </div>
    </div>
  )
}

// ── Upload button ─────────────────────────────────────────────────────
function UploadBtn({ label, accept, onUploaded, multiple = false }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)
  const handle = async (e) => {
    const files = e.target.files; if (!files.length) return
    setLoading(true)
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('files', f))
    const r = await af('/media/upload', { method: 'POST', body: fd })
    const d = await r.json()
    setLoading(false)
    if (d.success) onUploaded(d.files)
    e.target.value = ''
  }
  return (
    <>
      <button onClick={() => ref.current.click()} style={{ ...S.btnSecondary, fontSize: 12 }} disabled={loading}>
        {loading ? '⏳ Đang upload...' : label}
      </button>
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handle} />
    </>
  )
}

// ── Media picker ──────────────────────────────────────────────────────
function MediaPicker({ value, onSelect, accept = 'image/*,video/*', label = 'Chọn media' }) {
  const [media, setMedia] = useState([])
  const [open, setOpen] = useState(false)
  const loadMedia = async () => {
    const r = await af('/media'); const d = await r.json()
    setMedia(Array.isArray(d) ? d : [])
  }
  const openPicker = () => { loadMedia(); setOpen(true) }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={openPicker} style={{ ...S.btnSecondary, fontSize: 12 }}>{label}</button>
        {value && <button onClick={() => onSelect(null)} style={{ ...S.btnDanger, fontSize: 11, padding: '4px 8px' }}>✕ Xoá</button>}
      </div>
      {value && (
        value.match(/\.(mp4|webm|mov)/i)
          ? <video src={`${BASE}${value}`} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 6 }} controls />
          : <img src={`${BASE}${value}`} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 6 }} alt="" />
      )}
      {open && (
        <div style={S.modalOverlay} onClick={() => setOpen(false)}>
          <div style={{ ...S.modalBox, width: 640, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={S.sectionTitle}>Thư viện media</p>
              <UploadBtn label="+ Upload mới" accept={accept} multiple onUploaded={() => loadMedia()} />
            </div>
            {media.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: 32 }}>Chưa có file nào</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {media.map((m, i) => (
                <div key={i} style={{ cursor: 'pointer', border: value === m.url ? '2px solid #111' : '2px solid transparent', borderRadius: 6 }}
                  onClick={() => { onSelect(m.url); setOpen(false) }}>
                  {m.type === 'video'
                    ? <div style={{ background: '#111', borderRadius: 4, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24 }}>▶</div>
                    : <img src={`${BASE}${m.url}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} alt="" />
                  }
                  <p style={{ fontSize: 10, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '2px 4px' }}>{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: SẢN PHẨM
// ══════════════════════════════════════════════════════════════════════
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size']
const BADGES = ['', 'New', 'Sale', 'Drop', 'Hot']
const AVAILABLE_COLORS = [
  { hex: '#111111', name: 'Đen' },
  { hex: '#ffffff', name: 'Trắng' },
  { hex: '#8b7d7b', name: 'Xám' },
  { hex: '#c0392b', name: 'Đỏ' },
  { hex: '#2f4f8f', name: 'Navy' },
]

function TabProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    af('/products').then(r => r.json()).then(d => Array.isArray(d) && setProducts(d))
    af('/categories').then(r => r.json()).then(d => Array.isArray(d) && setCategories(d))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const selectProduct = (p) => { setSelected(p); setForm({ ...p }); setMsg('') }

  const save = async () => {
    setSaving(true); setMsg('')
    const r = await af(`/products/${selected.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const d = await r.json(); setSaving(false)
    if (d.success) { setProducts(ps => ps.map(p => p.id === d.product.id ? d.product : p)); setSelected(d.product); setMsg('✓ Đã lưu!') }
    else setMsg('✗ Lỗi: ' + d.error)
  }

  const addProduct = async (data) => {
    const r = await af('/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json()
    if (d.success) { setProducts(ps => [...ps, d.product]); setShowAdd(false) }
  }

  const deleteProduct = async () => {
    if (!confirm(`Xoá "${selected.name}"?`)) return
    const r = await af(`/products/${selected.id}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) { setProducts(ps => ps.filter(p => p.id !== selected.id)); setSelected(null) }
  }

  const uploadImages = async (files) => {
    // files already uploaded to media library, now link to product
    const fd = new FormData()
    // re-upload directly to product
  }

  const uploadToProduct = async (e, id) => {
    const files = e.target.files; if (!files.length) return
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('images', f))
    const r = await af(`/products/${id}/images`, { method: 'POST', body: fd })
    const d = await r.json()
    if (d.success) {
      setProducts(ps => ps.map(p => p.id === id ? { ...p, images: d.images } : p))
      setSelected(s => s?.id === id ? { ...s, images: d.images } : s)
      setForm(f => ({ ...f, images: d.images }))
    }
    e.target.value = ''
  }

  const deleteImg = async (imgUrl) => {
    const r = await af(`/products/${selected.id}/images`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: imgUrl })
    })
    const d = await r.json()
    if (d.success) {
      setProducts(ps => ps.map(p => p.id === selected.id ? { ...p, images: d.images } : p))
      setForm(f => ({ ...f, images: d.images }))
    }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
  const imgRef = useRef()

  return (
    <div style={S.tabLayout}>
      {/* Sidebar list */}
      <div style={S.tabSidebar}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <input placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, marginBottom: 8 }} />
          <button onClick={() => setShowAdd(true)} style={{ ...S.btnPrimary, width: '100%', fontSize: 12 }}>+ Thêm sản phẩm</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => selectProduct(p)} style={{ ...S.listRow, background: selected?.id === p.id ? '#f5f5f5' : '#fff', borderLeft: selected?.id === p.id ? '3px solid #111' : '3px solid transparent' }}>
              {p.images?.[0] ? <img src={`${BASE}${p.images[0]}`} style={S.listThumb} alt="" /> : <div style={S.listThumbEmpty}>—</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={S.listName}>{p.name}</p>
                <p style={S.listMeta}>{p.category} · {fmt(p.price)}₫ · Tồn: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit panel */}
      <div style={S.tabMain}>
        {!selected ? (
          <div style={S.empty}><p style={S.emptyIcon}>📦</p><p>Chọn sản phẩm để chỉnh sửa</p></div>
        ) : (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>{selected.name}</p>
              <button onClick={deleteProduct} style={S.btnDanger}>Xoá sản phẩm</button>
            </div>

            {/* Images */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Ảnh sản phẩm</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {form.images?.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={`${BASE}${img}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} alt="" />
                    <button onClick={() => deleteImg(img)} style={S.imgDel}>✕</button>
                  </div>
                ))}
                <div onClick={() => imgRef.current.click()} style={S.imgAdd}>+ Thêm ảnh</div>
                <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadToProduct(e, selected.id)} />
              </div>
            </div>

            {/* Basic info */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Thông tin cơ bản</p>
              <div style={S.grid2}>
                <Field label="Tên"><input value={form.name || ''} onChange={e => set('name', e.target.value)} style={S.input} /></Field>
                <Field label="Danh mục"><select value={form.category || ''} onChange={e => set('category', e.target.value)} style={S.input}>{categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}</select></Field>
                <Field label="Giá (₫)"><input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} style={S.input} /></Field>
                <Field label="Giá cũ (₫)"><input type="number" value={form.oldPrice || ''} onChange={e => set('oldPrice', e.target.value)} placeholder="Để trống nếu không" style={S.input} /></Field>
                <Field label="Tồn kho"><input type="number" value={form.stock || ''} onChange={e => set('stock', e.target.value)} style={S.input} /></Field>
                <Field label="Badge"><select value={form.badge || ''} onChange={e => set('badge', e.target.value)} style={S.input}>{BADGES.map(b => <option key={b} value={b}>{b || '(Không có)'}</option>)}</select></Field>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                <label style={S.checkLabel}><input type="checkbox" checked={!!form.isNew} onChange={e => set('isNew', e.target.checked)} /> Sản phẩm mới</label>
                <label style={S.checkLabel}><input type="checkbox" checked={!!form.isSale} onChange={e => set('isSale', e.target.checked)} /> Đang sale</label>
              </div>
            </div>
            {/* Colors */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Màu sắc có bán</p>
              <ColorPicker value={form.colors || []} onChange={(colors) => set('colors', colors)} />
            </div>
            {/* Sizes */}
            
            <div style={S.card}>
              <p style={S.sectionTitle}>Sizes có bán</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {ALL_SIZES.map(s => (
                  <button key={s} onClick={() => set('sizes', form.sizes?.includes(s) ? form.sizes.filter(x => x !== s) : [...(form.sizes || []), s])}
                    style={{ ...S.sizeBtn, background: form.sizes?.includes(s) ? '#111' : '#f0f0f0', color: form.sizes?.includes(s) ? '#fff' : '#111' }}>{s}</button>
                ))}
              </div>
              <p style={{ ...S.sectionTitle, marginBottom: 8 }}>Sizes hết hàng</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.sizes?.map(s => (
                  <button key={s} onClick={() => set('soldOutSizes', form.soldOutSizes?.includes(s) ? form.soldOutSizes.filter(x => x !== s) : [...(form.soldOutSizes || []), s])}
                    style={{ ...S.sizeBtn, background: form.soldOutSizes?.includes(s) ? '#ef4444' : '#f0f0f0', color: form.soldOutSizes?.includes(s) ? '#fff' : '#111' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Mô tả</p>
              <Field label="Mô tả sản phẩm"><textarea value={form.desc || ''} onChange={e => set('desc', e.target.value)} style={{ ...S.input, minHeight: 80 }} /></Field>
              <Field label="Hướng dẫn bảo quản"><input value={form.care || ''} onChange={e => set('care', e.target.value)} style={S.input} /></Field>
              <Field label="Chất liệu"><input value={form.material || ''} onChange={e => set('material', e.target.value)} style={S.input} /></Field>
            </div>

            {msg && <p style={{ color: msg.startsWith('✓') ? '#10b981' : '#ef4444', fontWeight: 600, marginBottom: 12 }}>{msg}</p>}
            <button onClick={save} disabled={saving} style={S.btnPrimary}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Thêm sản phẩm mới" onClose={() => setShowAdd(false)}>
          <AddProductForm onAdd={addProduct} onClose={() => setShowAdd(false)} categories={categories} />
        </Modal>
      )}
    </div>
  )
}

function AddProductForm({ onAdd, onClose, categories = [] }) {
  const [f, setF] = useState({ name: '', category: categories[0]?.name || '', price: '', stock: 0, colors: [] })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <>
      <Field label="Tên *"><input value={f.name} onChange={e => set('name', e.target.value)} style={S.input} /></Field>
      <Field label="Danh mục"><select value={f.category} onChange={e => set('category', e.target.value)} style={S.input}>{categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}</select></Field>
      <Field label="Giá (₫) *"><input type="number" value={f.price} onChange={e => set('price', e.target.value)} style={S.input} /></Field>
      <Field label="Tồn kho"><input type="number" value={f.stock} onChange={e => set('stock', e.target.value)} style={S.input} /></Field>
      <Field label="Màu sắc">
        <ColorPicker value={f.colors} onChange={(colors) => set('colors', colors)} />
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => { if (!f.name || !f.price) return alert('Nhập tên và giá'); onAdd(f) }} style={S.btnPrimary}>Tạo sản phẩm</button>
        <button onClick={onClose} style={S.btnSecondary}>Huỷ</button>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: TRANG CHỦ
// ══════════════════════════════════════════════════════════════════════
function TabHomepage() {
  const [hp, setHp] = useState(null)
  const [section, setSection] = useState('ticker')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    af('/homepage').then(r => r.json()).then(d => setHp(d))
  }, [])

  const save = async (key, data) => {
    const r = await af(`/homepage/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json()
    if (d.success) { setHp(h => ({ ...h, [key]: d[key] })); setMsg('✓ Đã lưu!'); setTimeout(() => setMsg(''), 2000) }
    else setMsg('✗ Lỗi')
  }

  if (!hp) return <div style={S.empty}><p>Đang tải...</p></div>

  const sections = [
    { key: 'ticker', label: '📢 Ticker' },
    { key: 'hero', label: '🖼 Hero' },
    { key: 'marquee', label: '🎞 Marquee' },
    { key: 'banner', label: '📌 Banner' },
    { key: 'about', label: 'ℹ️ About' },
    { key: 'countdown', label: '⏱ Countdown' },
  ]

  return (
    <div style={S.tabLayout}>
      <div style={{ ...S.tabSidebar, width: 200 }}>
        <p style={{ padding: '16px 16px 8px', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Sections</p>
        {sections.map(s => (
          <div key={s.key} onClick={() => setSection(s.key)} style={{ padding: '10px 16px', cursor: 'pointer', background: section === s.key ? '#f5f5f5' : 'transparent', borderLeft: section === s.key ? '3px solid #111' : '3px solid transparent', fontSize: 13, fontWeight: section === s.key ? 700 : 400 }}>
            {s.label}
          </div>
        ))}
      </div>
      <div style={S.tabMain}>
        {msg && <div style={{ background: '#f0fdf4', color: '#10b981', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>{msg}</div>}

        {section === 'ticker' && <TickerEditor data={hp.ticker} onSave={d => save('ticker', d)} />}
        {section === 'hero' && <HeroEditor data={hp.hero} onSave={d => save('hero', d)} />}
        {section === 'marquee' && <MarqueeEditor data={hp.marquee} onSave={d => save('marquee', d)} />}
        {section === 'banner' && <BannerEditor data={hp.banner} onSave={d => save('banner', d)} />}
        {section === 'about' && <AboutEditor data={hp.about} onSave={d => save('about', d)} />}
        {section === 'countdown' && <CountdownEditor data={hp.countdown} onSave={d => save('countdown', d)} />}
      </div>
    </div>
  )
}

function TickerEditor({ data, onSave }) {
  const [items, setItems] = useState([...data.items])
  const [enabled, setEnabled] = useState(data.enabled)
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Ticker — Thanh chạy trên cùng" />
      <div style={S.card}>
        <label style={S.checkLabel}><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Hiển thị ticker</label>
        <p style={{ ...S.sectionTitle, marginTop: 16 }}>Các dòng chữ (kéo để sắp xếp)</p>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n) }} style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ ...S.btnDanger, padding: '8px 12px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setItems([...items, 'Nội dung mới'])} style={{ ...S.btnSecondary, fontSize: 12, marginTop: 4 }}>+ Thêm dòng</button>
      </div>
      <button onClick={() => onSave({ enabled, items })} style={S.btnPrimary}>Lưu</button>
    </div>
  )
}

function HeroEditor({ data, onSave }) {
  const [f, setF] = useState({ ...data })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Hero — Phần đầu trang chủ" />
      <div style={S.card}>
        <p style={S.sectionTitle}>Nội dung chữ</p>
        <Field label="Eyebrow (dòng nhỏ trên tiêu đề)"><input value={f.eyebrow || ''} onChange={e => set('eyebrow', e.target.value)} style={S.input} /></Field>
        <Field label="Tiêu đề chính (dùng \n để xuống dòng)"><textarea value={f.title || ''} onChange={e => set('title', e.target.value)} style={{ ...S.input, minHeight: 80, fontFamily: 'monospace' }} /></Field>
        <Field label="Mô tả phụ"><textarea value={f.subtitle || ''} onChange={e => set('subtitle', e.target.value)} style={{ ...S.input, minHeight: 60 }} /></Field>
        <div style={S.grid2}>
          <Field label="Nút chính"><input value={f.btnPrimary || ''} onChange={e => set('btnPrimary', e.target.value)} style={S.input} /></Field>
          <Field label="Nút phụ"><input value={f.btnSecondary || ''} onChange={e => set('btnSecondary', e.target.value)} style={S.input} /></Field>
        </div>
      </div>
      <div style={S.card}>
        <p style={S.sectionTitle}>Media (ảnh hoặc video bên phải)</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['default', 'image', 'video'].map(t => (
            <button key={t} onClick={() => set('mediaType', t)} style={{ ...S.sizeBtn, background: f.mediaType === t ? '#111' : '#f0f0f0', color: f.mediaType === t ? '#fff' : '#111' }}>
              {t === 'default' ? 'Mặc định (SVG)' : t === 'image' ? 'Ảnh' : 'Video'}
            </button>
          ))}
        </div>
        {f.mediaType === 'image' && <MediaPicker value={f.image} onSelect={v => set('image', v)} accept="image/*" label="Chọn ảnh hero" />}
        {f.mediaType === 'video' && <MediaPicker value={f.video} onSelect={v => set('video', v)} accept="video/*" label="Chọn video hero" />}
      </div>
      <button onClick={() => onSave(f)} style={S.btnPrimary}>Lưu Hero</button>
    </div>
  )
}

function MarqueeEditor({ data, onSave }) {
  const [f, setF] = useState({ ...data, row1: [...data.row1], row2: [...data.row2] })
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Marquee — Dòng chữ chạy giữa trang" />
      <div style={S.card}>
        <label style={S.checkLabel}><input type="checkbox" checked={f.enabled} onChange={e => setF(p => ({ ...p, enabled: e.target.checked }))} /> Hiển thị marquee</label>
        <p style={{ ...S.sectionTitle, marginTop: 16 }}>Hàng 1 (chạy phải)</p>
        {f.row1.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={item} onChange={e => { const n = [...f.row1]; n[i] = e.target.value; setF(p => ({ ...p, row1: n })) }} style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <button onClick={() => setF(p => ({ ...p, row1: p.row1.filter((_, j) => j !== i) }))} style={{ ...S.btnDanger, padding: '8px 12px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setF(p => ({ ...p, row1: [...p.row1, 'Nội dung mới'] }))} style={{ ...S.btnSecondary, fontSize: 12, marginBottom: 16 }}>+ Thêm</button>
        <p style={S.sectionTitle}>Hàng 2 (chạy trái)</p>
        {f.row2.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={item} onChange={e => { const n = [...f.row2]; n[i] = e.target.value; setF(p => ({ ...p, row2: n })) }} style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <button onClick={() => setF(p => ({ ...p, row2: p.row2.filter((_, j) => j !== i) }))} style={{ ...S.btnDanger, padding: '8px 12px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setF(p => ({ ...p, row2: [...p.row2, 'Nội dung mới'] }))} style={{ ...S.btnSecondary, fontSize: 12 }}>+ Thêm</button>
      </div>
      <button onClick={() => onSave(f)} style={S.btnPrimary}>Lưu Marquee</button>
    </div>
  )
}

function BannerEditor({ data, onSave }) {
  const [f, setF] = useState({ ...data })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Banner — Thêm banner giữa trang" />
      <div style={S.card}>
        <label style={S.checkLabel}><input type="checkbox" checked={f.enabled} onChange={e => set('enabled', e.target.checked)} /> Hiển thị banner</label>
        <div style={{ marginTop: 16 }}>
          <Field label="Tiêu đề"><input value={f.title || ''} onChange={e => set('title', e.target.value)} style={S.input} /></Field>
          <Field label="Phụ đề"><input value={f.subtitle || ''} onChange={e => set('subtitle', e.target.value)} style={S.input} /></Field>
          <div style={S.grid2}>
            <Field label="Text nút"><input value={f.btnText || ''} onChange={e => set('btnText', e.target.value)} style={S.input} /></Field>
            <Field label="Link nút"><input value={f.btnLink || ''} onChange={e => set('btnLink', e.target.value)} style={S.input} /></Field>
          </div>
        </div>
        <p style={{ ...S.sectionTitle, marginTop: 8 }}>Media nền</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['none', 'image', 'video'].map(t => (
            <button key={t} onClick={() => set('mediaType', t)} style={{ ...S.sizeBtn, background: f.mediaType === t ? '#111' : '#f0f0f0', color: f.mediaType === t ? '#fff' : '#111' }}>
              {t === 'none' ? 'Không có' : t === 'image' ? 'Ảnh' : 'Video'}
            </button>
          ))}
        </div>
        {f.mediaType === 'image' && <MediaPicker value={f.image} onSelect={v => set('image', v)} accept="image/*" label="Chọn ảnh banner" />}
        {f.mediaType === 'video' && <MediaPicker value={f.video} onSelect={v => set('video', v)} accept="video/*" label="Chọn video banner" />}
      </div>
      <button onClick={() => onSave(f)} style={S.btnPrimary}>Lưu Banner</button>
    </div>
  )
}

function AboutEditor({ data, onSave }) {
  const [f, setF] = useState({ ...data, stats: [...data.stats] })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="About — Giới thiệu thương hiệu" />
      <div style={S.card}>
        <Field label="Eyebrow"><input value={f.eyebrow || ''} onChange={e => set('eyebrow', e.target.value)} style={S.input} /></Field>
        <Field label="Tiêu đề (dùng \n để xuống dòng)"><input value={f.title || ''} onChange={e => set('title', e.target.value)} style={S.input} /></Field>
        <Field label="Mô tả"><textarea value={f.desc || ''} onChange={e => set('desc', e.target.value)} style={{ ...S.input, minHeight: 80 }} /></Field>
        <p style={{ ...S.sectionTitle, marginTop: 8 }}>Số liệu thống kê</p>
        {f.stats.map((stat, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={stat.num} placeholder="Số" onChange={e => { const n = [...f.stats]; n[i] = { ...n[i], num: e.target.value }; set('stats', n) }} style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <input value={stat.label} placeholder="Nhãn" onChange={e => { const n = [...f.stats]; n[i] = { ...n[i], label: e.target.value }; set('stats', n) }} style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <button onClick={() => set('stats', f.stats.filter((_, j) => j !== i))} style={{ ...S.btnDanger, padding: '8px 12px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => set('stats', [...f.stats, { num: '', label: '' }])} style={{ ...S.btnSecondary, fontSize: 12 }}>+ Thêm số liệu</button>
      </div>
      <button onClick={() => onSave(f)} style={S.btnPrimary}>Lưu About</button>
    </div>
  )
}

function CountdownEditor({ data, onSave }) {
  const [f, setF] = useState({ ...data })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const dateVal = f.targetDate ? new Date(f.targetDate).toISOString().slice(0, 16) : ''
  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Countdown — Đếm ngược ra mắt" />
      <div style={S.card}>
        <label style={S.checkLabel}><input type="checkbox" checked={f.enabled} onChange={e => set('enabled', e.target.checked)} /> Hiển thị countdown</label>
        <div style={{ marginTop: 16 }}>
          <Field label="Tiêu đề (dùng \n để xuống dòng)"><textarea value={f.title || ''} onChange={e => set('title', e.target.value)} style={{ ...S.input, minHeight: 60 }} /></Field>
          <Field label="Mô tả"><textarea value={f.desc || ''} onChange={e => set('desc', e.target.value)} style={{ ...S.input, minHeight: 60 }} /></Field>
          <Field label="Ngày giờ kết thúc đếm ngược">
            <input type="datetime-local" value={dateVal} onChange={e => set('targetDate', new Date(e.target.value).toISOString())} style={S.input} />
          </Field>
        </div>
      </div>
      <button onClick={() => onSave(f)} style={S.btnPrimary}>Lưu Countdown</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: CỬA HÀNG
// ══════════════════════════════════════════════════════════════════════
function TabStores() {
  const [stores, setStores] = useState([])
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { af('/stores').then(r => r.json()).then(d => Array.isArray(d) && setStores(d)) }, [])

  const save = async (store) => {
    const r = await af(`/stores/${store.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store) })
    const d = await r.json()
    if (d.success) { setStores(ss => ss.map(s => s.id === d.store.id ? d.store : s)); setEditing(null); setMsg('✓ Đã lưu!'); setTimeout(() => setMsg(''), 2000) }
  }

  const add = async (data) => {
    const r = await af('/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json()
    if (d.success) { setStores(ss => [...ss, d.store]); setShowAdd(false) }
  }

  const del = async (id) => {
    if (!confirm('Xoá cửa hàng này?')) return
    const r = await af(`/stores/${id}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) setStores(ss => ss.filter(s => s.id !== id))
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Cửa hàng</h2>
        <button onClick={() => setShowAdd(true)} style={S.btnPrimary}>+ Thêm cửa hàng</button>
      </div>
      {msg && <div style={{ background: '#f0fdf4', color: '#10b981', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>{msg}</div>}
      {stores.map(store => (
        <div key={store.id} style={{ ...S.card, marginBottom: 12 }}>
          {editing?.id === store.id ? (
            <StoreForm data={editing} onChange={setEditing} onSave={() => save(editing)} onCancel={() => setEditing(null)} />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>{store.name}</p>
                <p style={{ fontSize: 13, color: '#555', margin: '0 0 2px' }}>{store.addr}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{store.hours}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing({ ...store })} style={S.btnSecondary}>Sửa</button>
                <button onClick={() => del(store.id)} style={S.btnDanger}>Xoá</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {showAdd && <Modal title="Thêm cửa hàng" onClose={() => setShowAdd(false)}><StoreForm data={{ name: '', addr: '', hours: '', mapUrl: '' }} onChange={() => {}} onSave={add} onCancel={() => setShowAdd(false)} isNew /></Modal>}
    </div>
  )
}

function StoreForm({ data, onChange, onSave, onCancel, isNew }) {
  const [f, setF] = useState({ ...data })
  const set = (k, v) => { const n = { ...f, [k]: v }; setF(n); onChange && onChange(n) }
  return (
    <>
      <Field label="Tên cửa hàng *"><input value={f.name} onChange={e => set('name', e.target.value)} style={S.input} /></Field>
      <Field label="Địa chỉ *"><input value={f.addr} onChange={e => set('addr', e.target.value)} style={S.input} /></Field>
      <Field label="Giờ mở cửa"><input value={f.hours} onChange={e => set('hours', e.target.value)} style={S.input} placeholder="VD: T2-CN: 10:00 - 22:00" /></Field>
      <Field label="Link Google Maps"><input value={f.mapUrl || ''} onChange={e => set('mapUrl', e.target.value)} style={S.input} placeholder="https://maps.google.com/..." /></Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => onSave(f)} style={S.btnPrimary}>{isNew ? 'Thêm cửa hàng' : 'Lưu'}</button>
        <button onClick={onCancel} style={S.btnSecondary}>Huỷ</button>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: MÃ GIẢM GIÁ
// ══════════════════════════════════════════════════════════════════════
function TabDiscounts() {
  const [codes, setCodes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { af('/discounts').then(r => r.json()).then(d => Array.isArray(d) && setCodes(d)) }, [])

  const del = async (code) => {
    if (!confirm(`Xoá mã ${code}?`)) return
    const r = await af(`/discounts/${code}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) setCodes(cs => cs.filter(c => c.code !== code))
  }

  const add = async (data) => {
    const r = await af('/discounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json()
    if (d.success) { setCodes(cs => [...cs, d]); setShowAdd(false); setMsg('✓ Đã thêm!'); setTimeout(() => setMsg(''), 2000) }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Mã giảm giá</h2>
        <button onClick={() => setShowAdd(true)} style={S.btnPrimary}>+ Thêm mã</button>
      </div>
      {msg && <div style={{ background: '#f0fdf4', color: '#10b981', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>{msg}</div>}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            {['Mã', 'Loại', 'Giá trị', 'Mô tả', ''].map(h => <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>{c.code}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.type === 'percent' ? 'Phần trăm' : c.type === 'freeship' ? 'Free ship' : 'Cố định'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.type === 'percent' ? `${c.value}%` : c.type === 'freeship' ? 'Miễn phí' : `${fmt(c.value)}₫`}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{c.desc}</td>
                <td style={{ padding: '12px 16px' }}><button onClick={() => del(c.code)} style={{ ...S.btnDanger, padding: '4px 10px', fontSize: 12 }}>Xoá</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && <Modal title="Thêm mã giảm giá" onClose={() => setShowAdd(false)}><AddDiscountForm onAdd={add} onClose={() => setShowAdd(false)} /></Modal>}
    </div>
  )
}

function AddDiscountForm({ onAdd, onClose }) {
  const [f, setF] = useState({ code: '', type: 'percent', value: '', desc: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <>
      <Field label="Mã giảm giá *"><input value={f.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="VD: SUMMER20" style={{ ...S.input, fontFamily: 'monospace', fontWeight: 700 }} /></Field>
      <Field label="Loại">
        <select value={f.type} onChange={e => set('type', e.target.value)} style={S.input}>
          <option value="percent">Phần trăm (%)</option>
          <option value="fixed">Cố định (₫)</option>
          <option value="freeship">Free ship</option>
        </select>
      </Field>
      {f.type !== 'freeship' && <Field label={f.type === 'percent' ? 'Giá trị (%)' : 'Giá trị (₫)'}><input type="number" value={f.value} onChange={e => set('value', e.target.value)} style={S.input} /></Field>}
      <Field label="Mô tả"><input value={f.desc} onChange={e => set('desc', e.target.value)} style={S.input} /></Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => { if (!f.code) return alert('Nhập mã'); onAdd(f) }} style={S.btnPrimary}>Thêm mã</button>
        <button onClick={onClose} style={S.btnSecondary}>Huỷ</button>
      </div>
    </>
  )
}
// ══════════════════════════════════════════════════════════════════════
// TAB: DANH MỤC
// ══════════════════════════════════════════════════════════════════════
function TabCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [msg, setMsg] = useState('')

  const load = () => af('/categories').then(r => r.json()).then(d => Array.isArray(d) && setCategories(d))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!newName.trim()) return
    const r = await af('/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) })
    const d = await r.json()
    if (d.success) { setCategories(cs => [...cs, d.category]); setNewName(''); setMsg('✓ Đã thêm!'); setTimeout(() => setMsg(''), 2000) }
    else setMsg('✗ ' + d.error)
  }

  const del = async (id, name) => {
    if (!confirm(`Xoá danh mục "${name}"?`)) return
    const r = await af(`/categories/${id}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) { setCategories(cs => cs.filter(c => c._id !== id)); setMsg('✓ Đã xoá!'); setTimeout(() => setMsg(''), 2000) }
    else { const data = await r.json().catch(() => null); setMsg('✗ ' + (d.error || 'Không thể xoá')) }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800 }}>Danh mục sản phẩm</h2>
      {msg && <div style={{ background: msg.startsWith('✓') ? '#f0fdf4' : '#fef2f2', color: msg.startsWith('✓') ? '#10b981' : '#ef4444', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>{msg}</div>}

      <div style={S.card}>
        <p style={S.sectionTitle}>Thêm danh mục mới</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="VD: Giày, Túi xách..." style={{ ...S.input, marginBottom: 0, flex: 1 }} />
          <button onClick={add} style={S.btnPrimary}>+ Thêm</button>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        {categories.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Chưa có danh mục nào</p>}
        {categories.map(c => (
          <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
            <button onClick={() => del(c._id, c.name)} style={{ ...S.btnDanger, padding: '4px 10px', fontSize: 12 }}>Xoá</button>
          </div>
        ))}
      </div>
    </div>
  )
}
// ══════════════════════════════════════════════════════════════════════
// TAB: ĐƠN HÀNG
// ══════════════════════════════════════════════════════════════════════
function TabOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => { af('/orders').then(r => r.json()).then(d => Array.isArray(d) && setOrders(d)) }, [])

  const updateStatus = async (orderNumber, status) => {
    const r = await af(`/orders/${orderNumber}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const d = await r.json()
    if (d.success) { setOrders(os => os.map(o => o.orderNumber === orderNumber ? { ...o, status } : o)); setSelected(s => s?.orderNumber === orderNumber ? { ...s, status } : s) }
  }

  const deleteOrder = async (orderNumber) => {
    if (!confirm(`Xoá đơn hàng #${orderNumber}?`)) return
    const r = await af(`/orders/${orderNumber}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) {
      setOrders(os => os.filter(o => o.orderNumber !== orderNumber))
      setSelected(null)
    }
  }

  return (
    <div style={S.tabLayout}>
      <div style={S.tabSidebar}>
        <p style={{ padding: '16px 16px 8px', fontWeight: 700, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{orders.length} đơn hàng</p>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {orders.length === 0 && <p style={{ padding: '2rem 16px', color: '#aaa', fontSize: 13 }}>Chưa có đơn hàng</p>}
          {orders.map(o => (
            <div key={o.orderNumber} onClick={() => setSelected(o)} style={{ ...S.listRow, background: selected?.orderNumber === o.orderNumber ? '#f5f5f5' : '#fff', borderLeft: selected?.orderNumber === o.orderNumber ? '3px solid #111' : '3px solid transparent' }}>
              <div style={{ flex: 1 }}>
                <p style={{ ...S.listName, fontFamily: 'monospace' }}>#{o.orderNumber}</p>
                <p style={S.listMeta}>{o.customer?.name} · {fmt(o.total)}₫</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>{STATUS_LABELS[o.status]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={S.tabMain}>
        {!selected ? <div style={S.empty}><p style={S.emptyIcon}>📋</p><p>Chọn đơn hàng để xem chi tiết</p></div> : (
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 20, margin: '0 0 4px', fontFamily: 'monospace' }}>#{selected.orderNumber}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{selected.createdAt ? new Date(selected.createdAt).toLocaleString('vi-VN') : ''}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Trạng thái</p>
                  <select value={selected.status} onChange={e => updateStatus(selected.orderNumber, e.target.value)} style={{ ...S.input, marginBottom: 0, fontWeight: 700, color: STATUS_COLORS[selected.status] }}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <button onClick={() => deleteOrder(selected.orderNumber)} style={S.btnDanger}>
                  🗑 Xoá đơn hàng
                </button>
              </div>
            </div>
            <div style={S.card}>
              <p style={S.sectionTitle}>Thông tin khách hàng</p>
              <p style={{ fontSize: 14, margin: '0 0 4px' }}>
                <b>{selected.customer?.lastName} {selected.customer?.firstName}</b>
              </p>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 2px' }}>
                📧 {selected.customer?.email}
              </p>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 2px' }}>
                 {selected.customer?.phone}
              </p>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 2px' }}>
                 {selected.customer?.address}{selected.customer?.city ? ', ' + selected.customer?.city : ''}
              </p>
            </div>
            <div style={S.card}>
              <p style={S.sectionTitle}>Sản phẩm</p>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Size: {item.size} · Màu: {item.color} · x{item.qty}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(item.price * item.qty)}₫</p>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTop: '2px solid #111' }}>
                <p style={{ fontWeight: 700, margin: 0 }}>Tổng cộng</p>
                <p style={{ fontWeight: 900, fontSize: 16, margin: 0 }}>{fmt(selected.total)}₫</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: CÀI ĐẶT
// ══════════════════════════════════════════════════════════════════════
function TabSettings() {
  const [f, setF] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { af('/settings').then(r => r.json()).then(d => setF(d)) }, [])
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setNested = (parent, k, v) => setF(p => ({ ...p, [parent]: { ...p[parent], [k]: v } }))

  const save = async () => {
    const r = await af('/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    const d = await r.json()
    if (d.success) { setMsg('✓ Đã lưu!'); setTimeout(() => setMsg(''), 2000) }
  }

  if (!f) return <div style={S.empty}><p>Đang tải...</p></div>

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800 }}>Cài đặt chung</h2>
      {msg && <div style={{ background: '#f0fdf4', color: '#10b981', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>{msg}</div>}

      <div style={S.card}>
        <p style={S.sectionTitle}>Thương hiệu</p>
        <div style={S.grid2}>
          <Field label="Tên thương hiệu"><input value={f.brandName || ''} onChange={e => set('brandName', e.target.value)} style={S.input} /></Field>
          <Field label="Slogan"><input value={f.slogan || ''} onChange={e => set('slogan', e.target.value)} style={S.input} /></Field>
          <Field label="Năm thành lập"><input value={f.estYear || ''} onChange={e => set('estYear', e.target.value)} style={S.input} /></Field>
          <Field label="Giá free ship (₫)"><input type="number" value={f.freeShipThreshold || ''} onChange={e => set('freeShipThreshold', Number(e.target.value))} style={S.input} /></Field>
        </div>
        <Field label="Mô tả footer"><textarea value={f.footerDesc || ''} onChange={e => set('footerDesc', e.target.value)} style={{ ...S.input, minHeight: 60 }} /></Field>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Mạng xã hội</p>
        <div style={S.grid2}>
          <Field label="Instagram"><input value={f.social?.instagram || ''} onChange={e => setNested('social', 'instagram', e.target.value)} style={S.input} /></Field>
          <Field label="TikTok"><input value={f.social?.tiktok || ''} onChange={e => setNested('social', 'tiktok', e.target.value)} style={S.input} /></Field>
          <Field label="Facebook"><input value={f.social?.facebook || ''} onChange={e => setNested('social', 'facebook', e.target.value)} style={S.input} /></Field>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>SEO</p>
        <Field label="Tiêu đề trang (title)"><input value={f.seo?.title || ''} onChange={e => setNested('seo', 'title', e.target.value)} style={S.input} /></Field>
        <Field label="Mô tả (description)"><textarea value={f.seo?.description || ''} onChange={e => setNested('seo', 'description', e.target.value)} style={{ ...S.input, minHeight: 60 }} /></Field>
        <Field label="Từ khoá (keywords)"><input value={f.seo?.keywords || ''} onChange={e => setNested('seo', 'keywords', e.target.value)} style={S.input} /></Field>
      </div>

      <button onClick={save} style={S.btnPrimary}>Lưu cài đặt</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// TAB: THƯ VIỆN MEDIA
// ══════════════════════════════════════════════════════════════════════
function TabMedia() {
  const [media, setMedia] = useState([])
  const [filter, setFilter] = useState('all')

  const load = () => af('/media').then(r => r.json()).then(d => Array.isArray(d) && setMedia(d))
  useEffect(() => { load() }, [])

  const del = async (url) => {
    if (!confirm('Xoá file này?')) return
    const r = await af('/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    const d = await r.json()
    if (d.success) load()
  }

  const filtered = media.filter(m => filter === 'all' || m.type === filter)

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Thư viện Media</h2>
        <UploadBtn label="+ Upload ảnh/video" accept="image/*,video/*" multiple onUploaded={() => load()} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'image', 'video'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ ...S.sizeBtn, background: filter === t ? '#111' : '#f0f0f0', color: filter === t ? '#fff' : '#111' }}>
            {t === 'all' ? `Tất cả (${media.length})` : t === 'image' ? `Ảnh (${media.filter(m => m.type === 'image').length})` : `Video (${media.filter(m => m.type === 'video').length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ ...S.empty, height: 200 }}><p>Chưa có file nào. Upload ngay!</p></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {filtered.map((m, i) => (
          <div key={i} style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            {m.type === 'video'
              ? <div style={{ height: 100, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 }}>▶</div>
              : <img src={`${BASE}${m.url}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} alt="" />
            }
            <div style={{ padding: '8px 10px' }}>
              <p style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 6px' }}>{m.name}</p>
              <button onClick={() => del(m.url)} style={{ ...S.btnDanger, fontSize: 11, padding: '3px 8px', width: '100%' }}>Xoá</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════
function Field({ label, children }) {
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 4 }}>{label}{children}</label>
}
function ColorPicker({ value = [], onChange }) {
  const toggle = (color) => {
    const exists = value.some(c => c.hex === color.hex)
    if (exists) onChange(value.filter(c => c.hex !== color.hex))
    else onChange([...value, color])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {AVAILABLE_COLORS.map(c => {
        const active = value.some(v => v.hex === c.hex)
        return (
          <div key={c.hex} onClick={() => toggle(c)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: c.hex === '#ffffff' ? '#f5f5f5' : c.hex,
              border: active ? '3px solid #111' : '2px solid #ddd',
              margin: '0 auto 4px'
            }} />
            <span style={{ fontSize: 11, color: active ? '#111' : '#999', fontWeight: active ? 700 : 400 }}>{c.name}</span>
          </div>
        )
      })}
    </div>
  )
}
function SectionHeader({ title }) {
  return <h3 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 20px', letterSpacing: '-0.01em' }}>{title}</h3>
}

function Modal({ title, children, onClose }) {
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════
const TABS = [
  { key: 'products', label: '📦 Sản phẩm' },
  { key: 'categories', label: '🏷️ Danh mục' },
  { key: 'homepage', label: '🏠 Trang chủ' },
  { key: 'stores', label: '🏪 Cửa hàng' },
  { key: 'discounts', label: '🏷 Mã giảm giá' },
  { key: 'orders', label: '📋 Đơn hàng' },
  { key: 'media', label: '🖼 Media' },
  { key: 'settings', label: '⚙️ Cài đặt' },
]

export default function AdminPage() {
  const [tab, setTab] = useState('products')
  const [adminToken, setAdminToken] = useState(() => {
    const authToken = localStorage.getItem('mf_token')
    if (authToken) return authToken
    return localStorage.getItem(TOKEN_KEY) || ''
  })
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000')
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.event === 'new_order') {
          const notif = {
            id: Date.now(),
            text: `🛍 Đơn mới #${msg.data.orderNumber} — ${msg.data.customerName} — ${Number(msg.data.total).toLocaleString('vi-VN')}₫`,
            time: new Date().toLocaleTimeString('vi-VN'),
          }
          setNotifications(prev => [notif, ...prev].slice(0, 20))
          setUnread(prev => prev + 1)
        }
      } catch {}
    }
    ws.onerror = () => {}
    return () => ws.close()
  }, [])

  if (!adminToken) return <Login onLogin={(pw) => {
    localStorage.setItem(TOKEN_KEY, pw)
    setAdminToken(pw)
  }} />

  return (
    <div style={S.page}>
      <div style={S.topNav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '0.1em' }}>MIDDLE CHIEVOUS</span>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ ...S.tabBtn, background: tab === t.key ? '#111' : 'transparent', color: tab === t.key ? '#fff' : '#555' }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(v => !v); setUnread(0) }}
            style={{ background: 'none', border: '1px solid #eee', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 14, position: 'relative', marginRight: 8 }}>
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: '#fff', border: '1px solid #efefef', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999, maxHeight: 400, overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 700, fontSize: 13 }}>
                🔔 Thông báo
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                  Chưa có thông báo mới
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 13 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('mf_token')
          setAdminToken('')
          window.location.href = '/account'
        }} style={{ background: 'none', border: 'none', fontSize: 12, color: '#999', cursor: 'pointer' }}>
          Đăng xuất
        </button>
      </div>

      <div style={S.content}>
        {tab === 'products' && <TabProducts />}
        {tab === 'categories' && <TabCategories />}
        {tab === 'homepage' && <TabHomepage />}
        {tab === 'stores' && <TabStores />}
        {tab === 'discounts' && <TabDiscounts />}
        {tab === 'orders' && <TabOrders />}
        {tab === 'media' && <TabMedia />}
        {tab === 'settings' && <TabSettings />}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────
const S = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#fafafa', overflow: 'hidden' },
  topNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 52, background: '#fff', borderBottom: '1px solid #efefef', flexShrink: 0, gap: 16, overflowX: 'auto' },
  tabBtn: { padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' },
  content: { flex: 1, overflowY: 'auto', padding: 32 },

  tabLayout: { display: 'flex', height: '100%', margin: -32, overflow: 'hidden' },
  tabSidebar: { width: 280, borderRight: '1px solid #efefef', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0, overflowY: 'auto' },
  tabMain: { flex: 1, overflowY: 'auto', padding: 32 },

  card: { background: '#fff', border: '1px solid #efefef', borderRadius: 8, padding: 20, marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 },
  sectionTitle: { fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: '0 0 12px' },

  input: { padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 8 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' },

  listRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', transition: 'background 0.1s' },
  listThumb: { width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 },
  listThumbEmpty: { width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#aaa' },
  listName: { fontWeight: 600, fontSize: 13, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  listMeta: { fontSize: 11, color: '#888', margin: 0 },

  sizeBtn: { padding: '5px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' },
  imgDel: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imgAdd: { width: 80, height: 80, border: '2px dashed #ddd', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: '#aaa', fontWeight: 600, textAlign: 'center' },

  btnPrimary: { background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' },
  btnSecondary: { background: '#f0f0f0', color: '#333', border: 'none', padding: '10px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  btnDanger: { background: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 14px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: '#fff', borderRadius: 12, padding: 32, width: 480, maxHeight: '90vh', overflowY: 'auto' },

  loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' },
  loginBox: { width: 360, padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #efefef', textAlign: 'center' },
  loginLogo: { fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', margin: '0 0 4px' },
  loginSub: { fontSize: 11, color: '#888', letterSpacing: '0.1em', margin: '0 0 28px' },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#ccc', gap: 8 },
  emptyIcon: { fontSize: 40, margin: 0 },
}
