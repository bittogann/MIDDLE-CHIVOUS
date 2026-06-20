export default function SizeGuide() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,5vw,52px)', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Size Guide
      </h1>

      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: '2rem' }}>
        MIDDLE CHIVOUS sử dụng form <strong>Oversize</strong> — nếu bạn muốn vừa vặn hơn, hãy chọn size nhỏ hơn 1 size so với thông thường.
      </p>

      <Section title="Áo Tee & Hoodie">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--off)' }}>
              {['Size', 'Vai (cm)', 'Ngực (cm)', 'Dài áo (cm)', 'Cân nặng gợi ý'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid var(--border-md)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { size: 'XS', vai: '42', nguc: '88', dai: '64', kg: '40–50kg' },
              { size: 'S', vai: '44', nguc: '92', dai: '66', kg: '50–60kg' },
              { size: 'M', vai: '46', nguc: '96', dai: '68', kg: '60–70kg' },
              { size: 'L', vai: '48', nguc: '100', dai: '70', kg: '70–80kg' },
              { size: 'XL', vai: '50', nguc: '104', dai: '72', kg: '80–90kg' },
              { size: 'XXL', vai: '52', nguc: '108', dai: '74', kg: '90–100kg' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--off)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16 }}>{row.size}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.vai}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.nguc}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.dai}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.kg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Quần Cargo & Wide Leg">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--off)' }}>
              {['Size', 'Vòng eo (cm)', 'Vòng mông (cm)', 'Dài quần (cm)'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid var(--border-md)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { size: 'S', eo: '68–72', mong: '90–94', dai: '98' },
              { size: 'M', eo: '72–76', mong: '94–98', dai: '100' },
              { size: 'L', eo: '76–80', mong: '98–102', dai: '102' },
              { size: 'XL', eo: '80–84', mong: '102–106', dai: '104' },
              { size: 'XXL', eo: '84–88', mong: '106–110', dai: '106' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--off)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16 }}>{row.size}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.eo}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.mong}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.dai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Hướng dẫn đo">
        <p><strong>Vòng ngực:</strong> Đo vòng quanh phần ngực rộng nhất, giữ thước ngang.</p>
        <p><strong>Vòng eo:</strong> Đo vòng quanh phần eo nhỏ nhất.</p>
        <p><strong>Vòng mông:</strong> Đo vòng quanh phần mông rộng nhất.</p>
        <p><strong>Dài áo:</strong> Đo từ vai xuống gấu áo.</p>
        <p style={{ marginTop: '1rem', padding: '1rem', background: 'var(--off)', borderLeft: '3px solid var(--black)' }}>
          💡 Nếu bạn không chắc chắn về size, hãy liên hệ chúng tôi qua Instagram hoặc Facebook để được tư vấn trực tiếp!
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border-md)' }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 2, color: '#555' }}>{children}</div>
    </div>
  )
}