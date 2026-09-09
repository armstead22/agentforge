export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '16px',
          margin: 0
        }}>
          AgentForge
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#999999',
          marginBottom: '32px',
          margin: '16px 0 32px 0'
        }}>
          The AI Agency That Runs Itself
        </p>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#cccccc',
          marginBottom: '40px'
        }}>
          Deploy production-ready AI agents in under 10 minutes
        </p>
        <button style={{
          backgroundColor: '#00e87a',
          color: '#000000',
          border: 'none',
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00c264'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00e87a'}
        >
          Start Free Trial
        </button>
      </div>
    </main>
  )
}
