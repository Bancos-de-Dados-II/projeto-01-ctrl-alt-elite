# 🏫 API - Conecta Ensino (Backend)

> **Status do Projeto:** Concluído e Operacional 🚀

Uma API RESTful robusta desenvolvida para fornecer dados educacionais georreferenciados. Construída com a arquitetura Lite MVC e princípios de Clean Code, a API garante alta confiabilidade dos dados aplicando regras de negócio estritas na filtragem. O sistema utiliza relacionamentos de banco de dados otimizados para consultas espaciais e geolocalização.

## 💻 Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)**: Ambiente de execução.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança e previsibilidade do código.
- **[Express](https://expressjs.com/)**: Framework de roteamento ágil.
- **[Supabase](https://supabase.com/)**: Banco de Dados como Serviço (BaaS) usando PostgreSQL.
- **PostGIS**: Extensão do PostgreSQL utilizada para cálculos matemáticos de raio e distância espacial.

## 📂 Arquitetura do Projeto

O projeto segue a separação de responsabilidades (SoC) com integração direta via Foreign Keys e JOINs nativos no banco de dados, maximizando a performance:

```text
backEnd/
├── src/
│   ├── config/         # Guarda-costas do banco: Conexão Singleton com o Supabase
│   ├── controllers/    # O cérebro: Lógica de negócios, regras estritas de filtragem e JOINs
│   ├── routes/         # O carteiro: Mapeamento dos endpoints da API
│   └── server.ts       # O motor: Ponto de entrada que liga o servidor
├── .env                # Variáveis de ambiente (Segurança)
├── package.json        # Dependências e scripts
└── tsconfig.json       # Regras rigorosas de compilação

⚙️ Como Rodar o Servidor Localmente
1. Instale as dependências:
Navegue até a pasta backEnd e execute:

Bash
npm install
2. Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz da pasta backEnd com as suas credenciais de acesso:

Snippet de código
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_anon_aqui
3. Inicie o servidor:

Bash
npm run dev
O servidor estará disponível em http://localhost:3000.

📡 Documentação dos Endpoints (Rotas)
Abaixo estão listadas as rotas disponíveis para consumo pelo Frontend (ex: Leaflet, Chart.js).

1. Buscar Escolas (Com Filtros e Regras de Negócio)
Retorna a lista de escolas. O limite máximo de segurança é de 2000 pontos para não sobrecarregar a renderização do mapa no Frontend.

Método: GET

Rota: /escolas

Query Parameters (Opcionais):

municipio (string): Filtra pelo nome da cidade fazendo um INNER JOIN com a tabela de municípios (ex: Cajazeiras).

pcd (boolean): Filtra pela acessibilidade da escola (true ou false). Nota de Negócio: Para garantir dados confiáveis, o filtro true exige estritamente a validação conjunta de três colunas no banco (acesso_total, tem_rampa E tem_banheiro_pcd).

Exemplo de Resposta:

JSON
[
  {
    "codigo_inep": 25125427,
    "nome_escola": "COLEGIO CRESCENDO E APRENDENDO",
    "latitude": -6.760938,
    "longitude": -38.22544,
    "acesso_total": true,
    "tem_rampa": true,
    "tem_banheiro_pcd": true,
    "municipios": {
      "nome": "Sousa"
    }
  }
]
2. Listar Municípios
Consulta diretamente a tabela independente de municípios, retornando uma lista limpa e em ordem alfabética para a criação de componentes de seleção (Dropdowns/Selects) no Frontend com alta performance.

Método: GET

Rota: /escolas/municipios

Exemplo de Resposta:

JSON
[
  "Aguiar",
  "Cajazeiras",
  "João Pessoa",
  "Sousa"
]
3. Estatísticas Gerais
Agrega dados quantitativos sobre a rede de ensino em memória de forma rápida, entregando o JSON exato necessário para a montagem de gráficos e painéis (Dashboards).

Método: GET

Rota: /escolas/estatisticas

Exemplo de Resposta:

JSON
{
  "total_escolas": 1540,
  "com_acessibilidade": 800,
  "sem_acessibilidade": 740
}
4. Geolocalização (Busca por Proximidade)
Consome a função RPC (buscar_escolas_proximas) via PostGIS no banco de dados para calcular distâncias esféricas, retornando apenas as escolas num raio específico em torno da localização atual do usuário.

Método: GET

Rota: /escolas/proximas

Query Parameters:

lat (obrigatório, float): Latitude do dispositivo do usuário.

lng (obrigatório, float): Longitude do dispositivo do usuário.

raio (opcional, float): Raio de busca em quilômetros. O valor padrão é 10km.

Exemplo de Uso:

HTTP
GET /escolas/proximas?lat=-6.88&lng=-38.55&raio=5