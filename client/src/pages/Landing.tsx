interface Props {
  onLogin: () => void
  onRegister: () => void
}

const Landing = ({ onLogin, onRegister }: Props) => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>OnTime Errands</h1>
      <p style={{ fontSize: 18, color: '#334155' }}>
        We pick up what is already yours and bring it to you. No shopping, no guessing store stock. Canada-wide coverage for
        scheduled and urgent item movement.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={onLogin}>
          Log in
        </button>
        <button className="btn secondary" onClick={onRegister}>
          Sign up
        </button>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3>How it works</h3>
        <ol>
          <li>Choose Scheduled or Urgent pickup.</li>
          <li>Tell us where to pick up and drop off. Items must already exist and be paid for.</li>
          <li>Pay the flat fee. A runner will accept, pick up, and deliver.</li>
        </ol>
      </div>
    </div>
  )
}

export default Landing
