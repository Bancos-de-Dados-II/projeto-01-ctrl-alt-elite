import axios from 'axios';

// Configura o axios para apontar para o seu backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interface para o TypeScript entender como os dados da escola chegam do banco
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

// Função que dispara o GET para a rota do seu backend
export const getEscolas = async (): Promise<Escola[]> => {
  const response = await api.get<Escola[]>('/escolas');
  return response.data;
};