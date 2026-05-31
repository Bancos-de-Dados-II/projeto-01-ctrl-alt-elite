// Arquivo: src/routes/escolaRoutes.ts
import { Router } from 'express';
import { 
    buscarEscolas, 
    listarMunicipios, 
    obterEstatisticas, 
    buscarProximas 
} from '../controllers/escolaController';

const router = Router();

router.get('/', buscarEscolas);                  // Ex: /escolas?municipios=Cajazeiras
router.get('/municipios', listarMunicipios);     // URL: /escolas/municipios
router.get('/estatisticas', obterEstatisticas);   // URL: /escolas/estatisticas
router.get('/proximas', buscarProximas);         // Ex: /escolas/proximas?lat=-6.88&lng=-38.55&raio=5

export default router;