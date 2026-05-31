// Arquivo: src/server.ts
import express from 'express';
import cors from 'cors';
import escolaRoutes from './routes/escolaRouter';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de Teste
app.get('/', (req, res) => {
    res.json({ status: 'ok', mensagem: 'API rodando com sucesso!' });
});

// 2. Avisamos o servidor para usar a nossa rota
app.use('/escolas', escolaRoutes); 

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});