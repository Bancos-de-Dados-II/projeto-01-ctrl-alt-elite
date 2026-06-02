import L from 'leaflet';
import { MdMyLocation } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { getEscolas, type Escola } from '../services/api';
import 'leaflet/dist/leaflet.css';
import styles from './Mapa.module.css'; 

const posicaoInicial: [number, number] = [-6.88939393222458, -38.5451803981687]; // IFPB Campus Cajazeiras

// 🎯 Interface ajustada para suportar a tupla de coordenadas ou o valor nulo com segurança
interface BotaoGeolocalizacaoProps {
  setPosicaoUsuario: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

function BotaoGeolocalizacao({ setPosicaoUsuario }: BotaoGeolocalizacaoProps) {
  const map = useMap();

  const clicarLocalizar = () => {
    map.locate({ setView: true, maxZoom: 14 });
  };

  useEffect(() => {
    const onLocationFound = (e: L.LocationEvent) => {
      setPosicaoUsuario([e.latlng.lat, e.latlng.lng]);
      
      // Remove círculos antigos de precisão para não poluir o mapa
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle && layer.options.className === 'raio-precisao') {
          map.removeLayer(layer);
        }
      });

      // Adiciona a área de feedback visual do GPS
      L.circle(e.latlng, { 
        radius: 200, 
        color: '#E35336', 
        fillColor: '#E35336', 
        fillOpacity: 0.2,
        className: 'raio-precisao'
      }).addTo(map);
    };

    const onLocationError = () => {
      alert("Não foi possível acessar sua localização. Usando o IFPB como referência padrão.");
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
    };
  }, [map, setPosicaoUsuario]);

  return (
    <button 
      className={styles.geoButton} 
      onClick={clicarLocalizar}
      type="button"
      title="Centralizar na minha localização"
    >
      <MdMyLocation size={24} />
    </button>
  );
}

// 🧮 Função auxiliar para calcular distância geográfica (Fórmula de Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export function Mapa() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 📏 Margem de busca inicial em 10km baseada no IFPB ou localização atual
  const [posicaoUsuario, setPosicaoUsuario] = useState<[number, number] | null>(posicaoInicial);
  const [raioBusca, setRaioBusca] = useState<number>(10); 

  useEffect(() => {
    getEscolas()
      .then((dados) => {
        setEscolas(dados);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar escolas do banco:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Buscando escolas acessíveis no banco de dados...</p>
      </div>
    );
  }

  // 🔍 FILTRAGEM GEOGRÁFICA
  const escolasFiltradas = escolas.filter((escola) => {
    if (!posicaoUsuario) return true; 
    
    const distancia = calcularDistancia(
      posicaoUsuario[0], 
      posicaoUsuario[1], 
      escola.latitude, 
      escola.longitude
    );
    
    return distancia <= raioBusca;
  });

return (
  <div className={styles.telaDivididaContainer}>
    
    {/* 🧭 Barra Lateral de Filtros (Esquerda) */}
    <aside className={styles.barraLateral}>
      <h2 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 4px 0' }}>Filtrar</h2>
      
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '10px' }}>
        Espaço para o Dropdown de Disciplinas e Institutos
      </div>
    </aside>

    {/* 🗺️ Container do Mapa (Direita) */}
    <div className={styles.mapContainer}>
      
      {/* 1. Área Superior (Os 20% livres para Títulos e Filtros do Topo) */}
      <div className={styles.topoMapaContainer}>
        {/* Espaço reservado para o título de Localização e Input de busca à esquerda */}
        <div style={{ flex: 1 }}>
          {/* Seus cabeçalhos e a barra "Procurar" vão entrar aqui */}
        </div>

        {/* 🎛️ O Slider foi movido para cá (Fica alinhado à direita dentro dos 20% superiores) */}
        <div className={styles.sliderSuperior}>
          <div className={styles.sliderLabel}>
            <span>Distância de busca:</span>
            <strong className={styles.sliderValor}>{raioBusca} km</strong>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={raioBusca} 
            onChange={(e) => setRaioBusca(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>
      </div>

      {/* 2. O Mapa ocupando exatamente os 80% inferiores */}
      <MapContainer 
        center={posicaoInicial} 
        zoom={14} 
        zoomControl={true}
        style={{ height: '80%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
            
          {escolasFiltradas.map((escola) => {
            const iconeEscola = L.divIcon({
              className: styles.marcadorEscolaContainer, 
              iconSize: [22, 22],         
              iconAnchor: [11, 26], 
              html: `
                <div class="conecta-pin-balao">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                    <path d="M4.14 11.18c-.02.27-.14.53-.34.73l-1 1a1 1 0 0 0 0 1.41l1 1c.2.2.46.32.73.34V15c0-1.66 1.34-3 3-3h.18c-.27-.24-.46-.56-.54-.92L4.14 11.18z" opacity="0.8"/>
                    <path d="M12 16.5c-2.49 0-4.66-1.47-5.66-3.6A3.003 3.003 0 0 0 9 15h6c1.3 0 2.4-.83 2.82-2A6.234 6.234 0 0 1 12 16.5z"/>
                  </svg>
                  <div class="conecta-pin-seta"></div>
                </div>
              `
            });

            return (
              <Marker 
                key={escola.codigo_inep} 
                position={[escola.latitude, escola.longitude]} 
                icon={iconeEscola}
              >
                <Tooltip 
                  permanent 
                  direction="bottom" 
                  offset={[0, 10]} 
                  className={styles.nomeEscolaTooltip}
                >
                  {escola.nome_escola}
                </Tooltip>

                <Popup>
                  <strong className={styles.popupTitle}>{escola.nome_escola}</strong>
                  <span className={styles.popupInep}>INEP: {escola.codigo_inep}</span>
                  <hr className={styles.popupDivider} />
                  <div>
                    {escola.acesso_total ? (
                      <span className={styles.tagAcessivel}>Acessibilidade Total</span>
                    ) : (
                      <span className={styles.tagInacessivel}>Não Adaptada</span>
                    )}
                    <div className={styles.detalhesAcessibilidade}>
                      <div>Rampa de acesso: {escola.tem_rampa ? '✅ Sim' : '❌ Não'}</div>
                      <div>Banheiro PCD: {escola.tem_banheiro_pcd ? '✅ Sim' : '❌ Não'}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 🎯 Botão do GPS injetado no contexto do mapa */}
          <BotaoGeolocalizacao setPosicaoUsuario={setPosicaoUsuario} />

        </MapContainer>
      </div>

    </div>
  );
}