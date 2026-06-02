import L from 'leaflet';
import { MdMyLocation, MdSearch, MdKeyboardArrowDown, MdKeyboardArrowRight, MdSchool, MdPlace } from 'react-icons/md';
import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { getEscolas, getEscolasProximas, type Escola } from '../services/api';
import 'leaflet/dist/leaflet.css';
import styles from './Mapa.module.css';

const posicaoInicial: [number, number] = [-6.88939393222458, -38.5451803981687];

type TabAtiva = 'monitores' | 'escolas' | 'bibliotecas';

interface MapaProps {
  modoEscuro: boolean;
}

interface BotaoGeolocalizacaoProps {
  setPosicaoUsuario: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  setNomeCidade: React.Dispatch<React.SetStateAction<string>>;
}

// ─── Haversine ───────────────────────────────────────────────────────────────

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Nominatim reverso ───────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ConectaEnsino/1.0' } });
    const data = await res.json();
    const cidade = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    const estado = data.address?.state_code || data.address?.state || '';
    return cidade ? `${cidade} - ${estado}` : 'Localização atual';
  } catch {
    return 'Localização atual';
  }
}

// ─── Nominatim direto ────────────────────────────────────────────────────────

async function forwardGeocode(texto: string): Promise<{ lat: number; lng: number; nome: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&countrycodes=br&limit=1&accept-language=pt-BR`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ConectaEnsino/1.0' } });
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      nome: data[0].display_name.split(',').slice(0, 2).join(', '),
    };
  } catch {
    return null;
  }
}

// ─── Voa o mapa para posição ──────────────────────────────────────────────────

function VoarPara({ posicao }: { posicao: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (posicao) map.flyTo(posicao, 14, { duration: 1.2 });
  }, [posicao, map]);
  return null;
}

// ─── Tile layer que troca conforme o tema ─────────────────────────────────────

function TileLayerTema({ modoEscuro }: { modoEscuro: boolean }) {
  return modoEscuro ? (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    />
  ) : (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    />
  );
}

// ─── Botão GPS ────────────────────────────────────────────────────────────────

function BotaoGeolocalizacao({ setPosicaoUsuario, setNomeCidade }: BotaoGeolocalizacaoProps) {
  const map = useMap();

  const clicarLocalizar = () => map.locate({ setView: false, maxZoom: 14 });

  useEffect(() => {
    const onLocationFound = async (e: L.LocationEvent) => {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosicaoUsuario(pos);

      map.eachLayer((layer) => {
        if (layer instanceof L.Circle && (layer.options as any).className === 'raio-precisao') {
          map.removeLayer(layer);
        }
      });

      L.circle(e.latlng, {
        radius: 200,
        color: '#E35336',
        fillColor: '#E35336',
        fillOpacity: 0.2,
        className: 'raio-precisao',
      } as any).addTo(map);

      const nome = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      setNomeCidade(nome);
    };

    const onLocationError = () => {
      alert('Não foi possível acessar sua localização. Usando o IFPB como referência padrão.');
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
    };
  }, [map, setPosicaoUsuario, setNomeCidade]);

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

// ─── Componente Principal ─────────────────────────────────────────────────────

export function Mapa({ modoEscuro }: MapaProps) {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [posicaoUsuario, setPosicaoUsuario] = useState<[number, number] | null>(posicaoInicial);
  const [raioBusca, setRaioBusca] = useState<number>(20);
  const [nomeCidade, setNomeCidade] = useState<string>('Cajazeiras - PB');
  const [tabAtiva, setTabAtiva] = useState<TabAtiva>('escolas');
  const [filtroPCD, setFiltroPCD] = useState<boolean | null>(null);
  const [disciplinaAberta, setDisciplinaAberta] = useState(true);
  const [institutosAbertos, setInstitutosAbertos] = useState(true);
  const [textoBusca, setTextoBusca] = useState('');
  const [buscando, setBuscando] = useState(false);

  // Cores dinâmicas baseadas no tema
  const cor = {
    bg: modoEscuro ? '#1e293b' : '#ffffff',
    bgLateral: modoEscuro ? '#1e293b' : '#ffffff',
    bgTopo: modoEscuro ? '#1e293b' : '#ffffff',
    bgInput: modoEscuro ? '#0f172a' : '#ffffff',
    border: modoEscuro ? '#334155' : '#e2e8f0',
    texto: modoEscuro ? '#f1f5f9' : '#1e293b',
    textoMuted: modoEscuro ? '#94a3b8' : '#64748b',
    bgFiltro: modoEscuro ? '#0f172a' : '#f8fafc',
    bgFiltroHover: modoEscuro ? '#1e293b' : '#fef3ef',
    bgGrupo: modoEscuro ? '#0f172a' : '#f8fafc',
  };

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filtroPCD !== null) params.pcd = String(filtroPCD);

    getEscolas(params)
      .then((dados) => { setEscolas(dados); setLoading(false); })
      .catch((err) => { console.error('Erro ao buscar escolas:', err); setLoading(false); });
  }, [filtroPCD]);

  const executarBusca = useCallback(async () => {
    if (!textoBusca.trim()) return;
    setBuscando(true);
    const resultado = await forwardGeocode(textoBusca);
    if (resultado) {
      setPosicaoUsuario([resultado.lat, resultado.lng]);
      setNomeCidade(resultado.nome);
    } else {
      alert('Localização não encontrada. Tente o nome de uma cidade.');
    }
    setBuscando(false);
  }, [textoBusca]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') executarBusca();
  };

  const escolasFiltradas = escolas.filter((escola) => {
    if (!posicaoUsuario) return true;
    return calcularDistancia(posicaoUsuario[0], posicaoUsuario[1], escola.latitude, escola.longitude) <= raioBusca;
  });

  const criarIcone = (acessivel: boolean) =>
    L.divIcon({
      className: styles.marcadorEscolaContainer,
      iconSize: [22, 22],
      iconAnchor: [11, 26],
      html: `
        <div class="conecta-pin-balao" style="background-color:${acessivel ? '#E35336' : '#94a3b8'}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            <path d="M4.14 11.18c-.02.27-.14.53-.34.73l-1 1a1 1 0 0 0 0 1.41l1 1c.2.2.46.32.73.34V15c0-1.66 1.34-3 3-3h.18c-.27-.24-.46-.56-.54-.92L4.14 11.18z" opacity="0.8"/>
            <path d="M12 16.5c-2.49 0-4.66-1.47-5.66-3.6A3.003 3.003 0 0 0 9 15h6c1.3 0 2.4-.83 2.82-2A6.234 6.234 0 0 1 12 16.5z"/>
          </svg>
          <div class="conecta-pin-seta" style="border-color:${acessivel ? '#E35336' : '#94a3b8'} transparent transparent"></div>
        </div>
      `,
    });

  if (loading) {
    return (
      <div className={styles.loadingContainer} style={{ backgroundColor: modoEscuro ? '#1e293b' : undefined }}>
        <div className={styles.spinner}></div>
        <p style={{ color: modoEscuro ? '#94a3b8' : undefined }}>Buscando escolas acessíveis no banco de dados...</p>
      </div>
    );
  }

  const totalAcessiveis = escolasFiltradas.filter((e) => e.acesso_total).length;
  const totalNaoAdaptadas = escolasFiltradas.filter((e) => !e.acesso_total).length;

  return (
    <div className={styles.telaDivididaContainer}>

      {/* ─── SIDEBAR ─────────────────────────────────── */}
      <aside className={styles.barraLateral} style={{ backgroundColor: cor.bgLateral, borderColor: cor.border }}>
        <h2 className={styles.tituloFiltrar} style={{ color: cor.texto }}>Filtrar</h2>
        <hr className={styles.divisorFiltrar} style={{ borderColor: cor.border }} />

        {/* Acessibilidade */}
        <div className={styles.filtroSecao}>
          {[
            { label: '✅ Totalmente acessíveis', value: true, qtd: totalAcessiveis },
            { label: '❌ Não adaptadas', value: false, qtd: totalNaoAdaptadas },
          ].map(({ label, value, qtd }) => (
            <button
              key={String(value)}
              className={`${styles.filtroOpcao} ${filtroPCD === value ? styles.filtroAtivo : ''}`}
              onClick={() => setFiltroPCD(filtroPCD === value ? null : value)}
              style={{
                backgroundColor: filtroPCD === value ? '#fef3ef' : cor.bgFiltro,
                borderColor: filtroPCD === value ? '#E35336' : cor.border,
                color: filtroPCD === value ? '#E35336' : cor.texto,
              }}
            >
              <MdSchool size={18} />
              <span>{label}</span>
              <span className={styles.filtroContagem}>{qtd}</span>
            </button>
          ))}
        </div>

        {/* Disciplinas */}
        <div className={styles.filtroGrupo} style={{ borderColor: cor.border }}>
          <button
            className={styles.filtroGrupoHeader}
            onClick={() => setDisciplinaAberta(!disciplinaAberta)}
            style={{ backgroundColor: cor.bgGrupo, color: cor.texto }}
          >
            <span>🎓 Disciplinas</span>
            {disciplinaAberta ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
          </button>
          {disciplinaAberta && (
            <div className={styles.filtroGrupoConteudo} style={{ borderColor: cor.border }}>
              {['Português', 'Matemática', 'Geografia', 'História', 'Física'].map((d) => (
                <div key={d} className={styles.filtroItem} style={{ color: cor.textoMuted, borderColor: cor.border }}>
                  <span>{d}</span>
                  <MdKeyboardArrowRight size={16} className={styles.filtroSeta} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Institutos */}
        <div className={styles.filtroGrupo} style={{ borderColor: cor.border }}>
          <button
            className={styles.filtroGrupoHeader}
            onClick={() => setInstitutosAbertos(!institutosAbertos)}
            style={{ backgroundColor: cor.bgGrupo, color: cor.texto }}
          >
            <span>🏛️ Institutos</span>
            {institutosAbertos ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
          </button>
          {institutosAbertos && (
            <div className={styles.filtroGrupoConteudo} style={{ borderColor: cor.border }}>
              {['IFPB - Cajazeiras', 'UFCG - Cajazeiras', 'Univ. Santa Maria', 'Fac. Católica'].map((nome) => (
                <div key={nome} className={styles.filtroItem} style={{ color: cor.textoMuted, borderColor: cor.border }}>
                  <MdPlace size={14} />
                  <span>{nome}</span>
                  <MdKeyboardArrowRight size={16} className={styles.filtroSeta} />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAPA ────────────────────────────────────── */}
      <div className={styles.mapContainer} style={{ borderColor: cor.border }}>

        {/* Topo */}
        <div className={styles.topoMapaContainer} style={{ backgroundColor: cor.bgTopo, borderBottom: `1px solid ${cor.border}` }}>
          <div className={styles.topoEsquerda}>
            <div className={styles.localizacaoAtual} style={{ color: cor.textoMuted }}>
              <MdPlace size={18} color="#E35336" />
              <span>Localização atual:</span>
              <strong style={{ color: cor.texto }}>{nomeCidade}</strong>
            </div>

            <div className={styles.barraBusca} style={{ borderColor: cor.border, backgroundColor: cor.bgInput }}>
              <input
                type="text"
                className={styles.inputBusca}
                placeholder="Procurar cidade ou endereço..."
                value={textoBusca}
                onChange={(e) => setTextoBusca(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ backgroundColor: cor.bgInput, color: cor.texto }}
              />
              <button className={styles.btnBuscar} onClick={executarBusca} disabled={buscando}>
                <MdSearch size={20} />
              </button>
            </div>
          </div>

          {/* Slider */}
          <div className={styles.sliderSuperior}>
            <div className={styles.sliderLabel} style={{ color: cor.textoMuted }}>
              <span>Distância de busca:</span>
              <strong className={styles.sliderValor}>{raioBusca} km</strong>
            </div>
            <input
              type="range" min="1" max="100" value={raioBusca}
              onChange={(e) => setRaioBusca(Number(e.target.value))}
              className={styles.sliderInput}
            />
          </div>
        </div>

        {/* Mapa Leaflet */}
        <MapContainer center={posicaoInicial} zoom={14} style={{ flex: 1, width: '100%' }}>
          <TileLayerTema modoEscuro={modoEscuro} />
          <VoarPara posicao={posicaoUsuario} />

          {escolasFiltradas.map((escola) => (
            <Marker key={escola.codigo_inep} position={[escola.latitude, escola.longitude]} icon={criarIcone(escola.acesso_total)}>
              <Tooltip permanent direction="bottom" offset={[0, 10]} className={styles.nomeEscolaTooltip}>
                {escola.nome_escola}
              </Tooltip>
              <Popup>
                <strong className={styles.popupTitle}>{escola.nome_escola}</strong>
                <span className={styles.popupInep}>INEP: {escola.codigo_inep}</span>
                {escola.municipios?.nome && (
                  <span className={styles.popupMunicipio}>📍 {escola.municipios.nome}</span>
                )}
                <hr className={styles.popupDivider} />
                {escola.acesso_total
                  ? <span className={styles.tagAcessivel}>Acessibilidade Total</span>
                  : <span className={styles.tagInacessivel}>Não Adaptada</span>
                }
                <div className={styles.detalhesAcessibilidade}>
                  <div>Rampa de acesso: {escola.tem_rampa ? '✅ Sim' : '❌ Não'}</div>
                  <div>Banheiro PCD: {escola.tem_banheiro_pcd ? '✅ Sim' : '❌ Não'}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          <BotaoGeolocalizacao setPosicaoUsuario={setPosicaoUsuario} setNomeCidade={setNomeCidade} />
        </MapContainer>

        {/* Tabs */}
        <div className={styles.tabsContainer} style={{ backgroundColor: cor.bg, borderColor: cor.border }}>
          {(['monitores', 'escolas', 'bibliotecas'] as TabAtiva[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${tabAtiva === tab ? styles.tabAtiva : ''}`}
              onClick={() => setTabAtiva(tab)}
              style={tabAtiva !== tab ? { borderColor: cor.border, backgroundColor: cor.bgFiltro, color: cor.textoMuted } : {}}
            >
              {tab === 'monitores' && 'Monitores disponíveis'}
              {tab === 'escolas' && 'Escolas e Universidades'}
              {tab === 'bibliotecas' && 'Bibliotecas acessíveis'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}