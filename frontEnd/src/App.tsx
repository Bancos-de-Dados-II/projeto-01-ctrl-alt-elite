import { Mapa } from './components/Mapa';

function App() {
  return (
    <div style={{ 
      margin: 0, 
      padding: '24px', 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9', 
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#E35336', margin: '0 0 8px 0' }}>🏫 Conecta Ensino</h1>
        <p style={{ color: '#475569', margin: 0 }}>Encontre escolas acessíveis na Paraíba</p>
      </header>

      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Mapa />
      </main>
    </div>
  );
}

export default App;