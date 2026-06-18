// src/components/ProductSVG.jsx
export default function ProductSVG({ product, colorIdx = 0, size = 'card' }) {
  if (!product) return null;
  const color = product.colors?.[colorIdx] || product.colors?.[0];
  const hex = color?.hex || '#111';
  const isDark = hex === '#111' || hex === '#0f0f0f' || hex === '#2f4f8f';
  const bg = hex === '#fff' ? '#f0f0f0' : hex;
  const txt = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
  const txt2 = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  const isHoodie = product.category === 'Hoodie';
  const isPants = product.category === 'Pants' || product.category === 'Accessories';
  const w = size === 'thumb' ? 44 : 180;
  const h = size === 'thumb' ? 56 : 240;

  return (
    <svg width={w} height={h} viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="240" fill={bg} />
      {isHoodie ? (
        <>
          <rect x="30" y="60" width="120" height="150" rx="4" fill={txt2} />
          <path d="M30 60 Q55 40 90 38 Q125 40 150 60" stroke={txt} strokeWidth="1.5" fill="none" />
          <circle cx="90" cy="58" r="10" fill="none" stroke={txt} strokeWidth="1.5" />
          <rect x="75" y="130" width="30" height="12" rx="2" fill={txt2} />
          <line x1="30" y1="60" x2="10" y2="100" stroke={txt} strokeWidth="1.5" />
          <line x1="150" y1="60" x2="170" y2="100" stroke={txt} strokeWidth="1.5" />
        </>
      ) : isPants ? (
        <>
          <rect x="45" y="50" width="90" height="30" rx="2" fill={txt2} />
          <path d="M45 80 L35 220 L85 220 L90 130 L95 220 L145 220 L135 80 Z" fill={txt2} />
          <rect x="42" y="95" width="12" height="20" rx="2" fill={txt} opacity="0.4" />
          <rect x="126" y="95" width="12" height="20" rx="2" fill={txt} opacity="0.4" />
        </>
      ) : (
        <>
          <path d="M15 70 L55 50 L90 60 L125 50 L165 70 L148 110 L120 98 L120 210 L60 210 L60 98 L32 110 Z" fill={txt2} />
        </>
      )}
      <text x="90" y="225" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="900" fontSize="9" fill={txt} letterSpacing="4" textTransform="uppercase">
        MIDFINGER
      </text>
    </svg>
  );
}
