export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Alberta Family Contracts</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Professional cohabitation agreements and family contracts
      </p>
      <div style={{ backgroundColor: '#f97316', color: 'white', padding: '20px', borderRadius: '8px', margin: '20px auto', maxWidth: '400px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Cohabitation Agreement</h2>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>$700</div>
        <p style={{ margin: '10px 0 0 0' }}>Professional legal document</p>
      </div>
      <a href="/sign-up" style={{ display: 'inline-block', backgroundColor: '#f97316', color: 'white', padding: '15px 30px', textDecoration: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
        Start Your Free Preview →
      </a>
      <p style={{ marginTop: '20px', color: '#666' }}>No credit card required • Get started in 2 minutes</p>
    </div>
  );
}