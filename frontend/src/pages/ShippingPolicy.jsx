export default function ShippingPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,5vw,52px)', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Chính sách vận chuyển
      </h1>

      <Section title="1. Thời gian xử lý đơn hàng">
        <p>Đơn hàng được xử lý trong vòng <strong>1–2 ngày làm việc</strong> sau khi xác nhận thanh toán.</p>
        <p>Đơn hàng đặt vào cuối tuần hoặc ngày lễ sẽ được xử lý vào ngày làm việc tiếp theo.</p>
      </Section>

      <Section title="2. Phương thức vận chuyển">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--off)' }}>
              {['Phương thức', 'Thời gian', 'Phí'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid var(--border-md)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { method: 'Tiêu chuẩn', time: '2–3 ngày làm việc', fee: '30.000₫ (Miễn phí đơn từ 500K)' },
              { method: 'Nhanh', time: '1 ngày làm việc', fee: '50.000₫' },
              { method: 'Trong ngày', time: 'Nội thành Danang', fee: 'Freeship' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.method}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.time}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{row.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="3. Khu vực giao hàng">
        <p>MIDDLE CHIVOUS giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín.</p>
        <p>Giao hàng quốc tế hiện chưa được hỗ trợ.</p>
      </Section>

      <Section title="4. Theo dõi đơn hàng">
        <p>Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận được thông báo cập nhật trạng thái.</p>
        <p>Bạn có thể theo dõi đơn hàng trong phần <strong>Tài khoản → Đơn hàng của tôi</strong>.</p>
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