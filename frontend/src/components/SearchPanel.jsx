// src/components/SearchPanel.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import STATIC_PRODUCTS from '../data/staticProducts'
import { fmt } from '../utils/format'

export default function SearchPanel({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  const handleInput = (val) => {
    setQuery(val)
    const q = val.toLowerCase().trim()
    if (!q) { setResults([]); return }
    const found = STATIC_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
    setResults(found.slice(0, 6))
  }

  const goProduct = (id) => {
    onClose()
    setQuery('')
    setResults([])
    navigate(`/product/${id}`)
  }

  const doSearch = () => {
    if (!query.trim()) return
    onClose()
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
    setQuery('')
    setResults([])
  }

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'transparent',
          }}
          onClick={onClose}
        />
      )}
      <div style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 99,
        background: '#fff',
        borderBottom: '1px solid #efefef',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxHeight: open ? 400 : 0,
        overflow: 'hidden',
        pointerEvents: open ? 'all' : 'none',
        transition: 'max-height 0.3s ease',
        padding: open ? '1.25rem 2rem' : '0 2rem',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            style={{
              flex: 1, border: '1px solid #ddd', padding: '10px 14px',
              fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
            }}
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            autoComplete="off"
          />
          <button onClick={doSearch} style={{
            background: '#111', color: '#fff', border: 'none',
            padding: '10px 20px', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 12, letterSpacing: '.12em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>Tìm</button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {results.map((p) => (
            <div key={p.id} onClick={() => goProduct(p.id)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer', fontSize: 13,
            }}>
              <span>{p.name}</span>
              <span style={{ color: '#888', fontSize: 12 }}>{fmt(p.price)}</span>
            </div>
          ))}
          {query && results.length === 0 && (
            <div style={{ padding: '8px 0', color: '#888', fontSize: 13 }}>
              Không tìm thấy kết quả cho "{query}"
            </div>
          )}
        </div>
      </div>
    </>
  )
}