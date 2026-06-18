export default function ReturnPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,5vw,52px)', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Chính sách đổi trả
      </h1>

      <Section title="1. Điều kiện đổi trả">
        <p>Sản phẩm được đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.</p>
        <p>Sản phẩm phải còn nguyên tem, tag, chưa qua sử dụng, không có mùi lạ hoặc vết bẩn.</p>
        <p>Sản phẩm sale hoặc khuyến mãi không được đổi trả trừ trường hợp lỗi từ nhà sản xuất.</p>
      </Section>

      <Section title="2. Quy trình đổi trả">
        <p>Bước 1: Liên hệ MIDDLE CHIEVOUS qua Instagram hoặc Facebook với mã đơn hàng.</p>
        <p>Bước 2: Gửi sản phẩm về địa chỉ cửa hàng gần nhất.</p>
        <p>Bước 3: Chúng tôi kiểm tra và xử lý trong vòng 3–5 ngày làm việc.</p>
        <p>Bước 4: Hoàn tiền hoặc gửi sản phẩm mới cho bạn.</p>
      </Section>

      <Section title="3. Hình thức hoàn tiền">
        <p>Hoàn tiền qua chuyển khoản ngân hàng trong vòng 3–7 ngày làm việc.</p>
        <p>Phí vận chuyển đổi trả do khách hàng chịu trừ trường hợp lỗi từ MIDDLE CHIEVOUS.</p>
      </Section>

      <Section title="4. Liên hệ">
        <p>Instagram: @midwise</p>
        <p>Facebook: /midwise</p>
        <p>Email: support@midwise.com</p>
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