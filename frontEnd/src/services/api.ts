import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api-conecta-ensino.onrender.com',
});

export interface Escola {
  codigo_inep: number;
  nome_escola: string;
  latitude: number;
  longitude: number;
  acesso_total: boolean;
  tem_rampa: boolean;
  tem_banheiro_pcd: boolean;
  municipios?: {
    nome: string;
  };
}

// Busca com filtros: pcd (true/false) e municipio (string)
export const getEscolas = async (params: Record<string, string> = {}): Promise<Escola[]> => {
  const response = await api.get<Escola[]>('/escolas', { params });
  return response.data;
};

// Busca por proximidade via RPC do Supabase
export const getEscolasProximas = async (lat: number, lng: number, raio = 10): Promise<Escola[]> => {
  const response = await api.get<Escola[]>('/escolas/proximas', {
    params: { lat, lng, raio },
  });
  return response.data;
};

// Estatísticas gerais
export const getEstatisticas = async () => {
  const response = await api.get('/escolas/estatisticas');
  return response.data;
};

// Lista de municípios para autocomplete
export const getMunicipios = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/escolas/municipios');
  return response.data;
};