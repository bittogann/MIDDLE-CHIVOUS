// src/components/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import ProductSVG from './ProductSVG';
import { fmt } from '../utils/format';

export default function ProductCard({ product, onToast }) {
  const navigate = useNavigate();
  const { ids, toggle } = useWishlistStore();
  const isWishlisted = ids.includes(product.id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product.id);
    onToast?.(isWishlisted ? 'Đã bỏ yêu thích' : 'Đã lưu yêu thích!');
  };

  const outOfStock = product.stock === 0

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)} style={{ opacity: outOfStock ? 0.55 : 1 }}>
      <div className="prod-img-wrap">
        <div className="prod-img-inner">
  {product.images?.[0]
    ? <img
        src={`http://localhost:4000${product.images[0]}`}
        alt={product.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    : <ProductSVG product={product} colorIdx={0} />
  }
</div>
        {product.stock === 0
          ? <div className="prod-badge" style={{ background: '#999' }}>Hết hàng</div>
          : product.badge && <div className="prod-badge">{product.badge}</div>
        }
        <div style={{ position: 'absolute', top: '.75rem', right: '.75rem', zIndex: 2 }}>
          <button
            style={{
              background: isWishlisted ? 'var(--black)' : 'white',
              color: isWishlisted ? 'white' : 'var(--black)',
              border: '1px solid var(--border-md)',
              width: 32, height: 32, fontSize: 14, cursor: 'pointer', transition: 'all .2s'
            }}
            onClick={handleWishlist}
          >♥</button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-name">{product.name}</div>
        <div className="prod-price">
          {product.oldPrice && <span className="old">{fmt(product.oldPrice)}</span>}
          <span className="current">{fmt(product.price)}</span>
        </div>
        <div className="prod-colors">
          {product.colors?.map((c, i) => (
            <div key={i} className={`color-dot${i === 0 ? ' active' : ''}`}
              style={{ background: c.hex }} title={c.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
