import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// 1. ROTA PRINCIPAL: Buscar escolas com filtros
export const buscarEscolas = async (req: Request, res: Response) => {
    try {
        let query = supabase.from('escolas').select(`
            *,
            municipios!inner(nome)
        `);

        const pcd = req.query.pcd;
        const municipio = req.query.municipio as string; 
        if (pcd === 'true') {
            // A escola precisa ter os 3 requisitos true para ser considerada acessível
            query = query
                .eq('acesso_total', true)
                .eq('tem_rampa', true)
                .eq('tem_banheiro_pcd', true); 
        } 
        
        if (pcd === 'false') {
            query = query.or('acesso_total.eq.false,tem_rampa.eq.false,tem_banheiro_pcd.eq.false'); 
        }

        if (municipio) {
            query = query.ilike('municipios.nome', `%${municipio}%`); 
        } else {
            console.warn("Nenhum filtro de município fornecido. Retornando todas as escolas.");
        }

        const { data, error } = await query.limit(2000);
        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error("Erro ao buscar escolas:", error.message);
        res.status(500).json({ erro: 'Falha interna ao buscar as escolas.' });
    }
};
// 2. ROTA DE APOIO: Listar municípios 
export const listarMunicipios = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('municipios')
                                              .select('nome')
                                              .order('nome', { ascending: true });
        if (error) throw error;

        const municipiosUnicos = data.map(item => item.nome);

        res.json(municipiosUnicos);
    } catch (error: any) {
        console.error("Erro ao listar municípios:", error.message);
        res.status(500).json({ erro: 'Falha interna ao listar os municípios.' });
    }
};

// 3. ROTA DE GRÁFICOS: Estatísticas
export const obterEstatisticas = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('escolas').select('acesso_total');
        if (error) throw error;

        const totalEscolas = data.length;
        const comAcessibilidade = data.filter(e => e.acesso_total === true).length;
        const semAcessibilidade = totalEscolas - comAcessibilidade;

        res.json({
            total_escolas: totalEscolas,
            com_acessibilidade: comAcessibilidade,
            sem_acessibilidade: semAcessibilidade
        });
    } catch (error: any) {
        console.error("Erro ao gerar estatísticas:", error.message);
        res.status(500).json({ erro: 'Falha interna ao calcular dados estatísticos.' });
    }
};

// 4. ROTA DE GEOLOCALIZAÇÃO: Escolas próximas
export const buscarProximas = async (req: Request, res: Response) => {
    try {
        const lat = parseFloat(req.query.lat as string);
        const lng = parseFloat(req.query.lng as string);
        const raio = parseFloat(req.query.raio as string) || 10; 

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ erro: 'As coordenadas lat e lng são obrigatórias e devem ser números.' });
        }

        const { data, error } = await supabase.rpc('buscar_escolas_proximas', {
            user_lat: lat,
            user_lng: lng,
            raio_km: raio
        });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error("Erro na busca espacial:", error.message);
        res.status(500).json({ erro: 'Falha interna na busca por geolocalização.' });
    }
};