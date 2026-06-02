import { useState, useEffect } from 'react';
import { Mapa } from './components/Mapa';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

function App() {
  const [modoEscuro, setModoEscuro] = useState(() => {
    // Lembra a preferência do usuário entre sessões
    return localStorage.getItem('tema') === 'escuro';
  });

  useEffect(() => {
    // Aplica/remove a classe no <html> para o CSS funcionar globalmente
    document.documentElement.classList.toggle('dark', modoEscuro);
    localStorage.setItem('tema', modoEscuro ? 'escuro' : 'claro');
  }, [modoEscuro]);

  return (
    <div style={{
      margin: 0,
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: modoEscuro ? '#0f172a' : '#f1f5f9',
      fontFamily: 'system-ui, sans-serif',
      transition: 'background-color 0.3s ease',
    }}>
      <header style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto 24px auto',
      }}>
        <div>
          <h1 style={{ color: '#E35336', margin: '0 0 4px 0' }}>🏫 Conecta Ensino</h1>
          <p style={{ color: modoEscuro ? '#94a3b8' : '#475569', margin: 0 }}>
            Encontre escolas acessíveis na Paraíba
          </p>
        </div>

        {/* Botão de alternar tema */}
        <button
          onClick={() => setModoEscuro(!modoEscuro)}
          title={modoEscuro ? 'Modo claro' : 'Modo escuro'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '24px',
            border: '1px solid',
            borderColor: modoEscuro ? '#334155' : '#e2e8f0',
            backgroundColor: modoEscuro ? '#1e293b' : '#ffffff',
            color: modoEscuro ? '#f1f5f9' : '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          {modoEscuro
            ? <><MdLightMode size={18} color="#facc15" /> Modo claro</>
            : <><MdDarkMode size={18} /> Modo escuro</>
          }
        </button>
      </header>

      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Mapa modoEscuro={modoEscuro} />
      </main>
    </div>
  );
}

export default App;