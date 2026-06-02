🏫 ConectaEnsino - Plataforma de Inclusão Educacional
Status do Projeto: Frontend & Backend Concluídos e Operacionais em Produção 🚀

O ConectaEnsino é uma plataforma de impacto social com foco na inclusão educacional, projetada para mapear e georreferenciar escolas acessíveis na região do Sertão Paraibano. O sistema calcula distâncias geográficas em tempo real a partir da localização do usuário, aplicando regras estritas de acessibilidade para conectar alunos e monitorias a polos educacionais adaptados.

🗺️ Arquitetura de Deploy (Produção)
A plataforma adota uma arquitetura desacoplada para otimização de custos e performance:

Frontend: Hospedado de forma estática no GitHub Pages com compilação otimizada pelo Vite.

Backend & Banco de Dados: Servidor RESTful hospedado no Render, comunicando-se com instâncias relacionais no Supabase e realizando queries espaciais.

📂 Estrutura do Repositório Monorepo
Plaintext
projeto-01-ctrl-alt-elite/
├── package.json             # 🎛️ NOVO: Script Global de automação e instalação
├── backEnd/                 # API RESTful (Hospedado no Render)
│   ├── src/
│   │   ├── config/          # Conexão Singleton de segurança com o Supabase
│   │   ├── controllers/     # Regras estritas de filtragem, JOINs e lógica de negócio
│   │   ├── routes/          # Mapeamento dos endpoints HTTP
│   │   └── server.ts        # Ponto de entrada do servidor Express
│   └── package.json         # Dependências do servidor (CORS, Express, etc.)
│
└── frontEnd/                # Aplicação SPA React (Hospedado no GitHub Pages)
    ├── src/
    │   ├── components/      # Subcomponentes (ex: BotaoGeolocalizacao)
    │   ├── services/        # Cliente de API isolado via Axios (api.ts)
    │   ├── Mapa.tsx         # Core do mapa, filtros de Haversine e renderização
    │   └── Mapa.module.css  # CSS Modules otimizado com Design Tokens (:root)
    ├── .env.production      # Injeção da URL de produção do Render
    ├── vite.config.ts       # Configuração de caminhos base do GH Pages
    └── package.json         # Scripts de automação de Deploy (gh-pages, react-icons)
🛠️ Tecnologias & Dependências Prévias
Backend (backEnd/package.json)
Node.js & TypeScript: Ambiente de execução e tipagem estática segura.

Express: Framework HTTP de alta performance para rotas.

Cors (^2.8.5): Habilitado para permitir requisições seguras vindas do domínio do GitHub Pages.

Supabase JS Client (^2.43.0): Integração nativa com PostgreSQL e PostGIS.

Frontend (frontEnd/package.json)
React (^18.x) & Vite: Tooling ultra-rápido para o desenvolvimento do ecossistema.

Leaflet (^1.9.4) & React-Leaflet (^4.2.1): Renderização de mapas e camadas de tiles vetoriais.

Axios (^1.6.8): Cliente HTTP mapeado em api.ts.

React Icons (^5.2.1): Injeção do pacote nativo de ícones vetoriais (Material Design) para o GPS.

Gh-pages (^6.1.1): Automação de build e deploy por linha de comando.

⚡ Instalação Rápida Monorepo (Tudo de uma vez)
Graças ao gerenciador global configurado na raiz do repositório, você não precisa mais entrar pasta por pasta para instalar os pacotes.

1. Instalar todas as dependências (Front e Back)
Abra o terminal na raiz do projeto (onde fica o package.json global) e execute:

Bash
npm run install-all
Esse comando instalará simultaneamente todas as ferramentas do Backend e todas as bibliotecas do Frontend, incluindo o mapa do Leaflet e o pacote vetorial de ícones.

2. Comandos Rápidos de Execução
Ainda a partir da raiz do projeto, você pode rodar os ambientes separadamente usando:

Para iniciar o Backend: npm run dev-back

Para iniciar o Frontend: npm run dev-front

⚙️ Configuração das Variáveis de Ambiente
Antes de rodar, certifique-se de configurar as credenciais nas subpastas:

No Backend (/backEnd/.env):

Snippet de código
PORT=3000
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_KEY=sua_chave_anon_aqui
No Frontend (/frontEnd/.env.production):

Snippet de código
VITE_API_URL=https://api-conecta-ensino.onrender.com
📡 Documentação de Endpoints da API
1. Listagem Geral de Escolas
Retorna a lista de escolas cadastradas. O limite de segurança por query é de 2000 pontos.

Método: GET | Rota: /escolas

Query Parameters:

municipio (string): Filtra pelo nome exato da cidade via INNER JOIN.

pcd (boolean): Filtra escolas com acessibilidade total.

Regra de Negócio: O filtro pcd=true exige validação simultânea de 3 colunas em nível de banco: acesso_total, tem_rampa E tem_banheiro_pcd.

2. Filtro por Raio Dinâmico (Proximidade)
Dispara os cálculos esféricos com base na posição atual enviada pelo botão de alvo do GPS.

Método: GET | Rota: /escolas/proximas

Query Parameters: lat (float), lng (float), raio (float opcional, padrão 10km).

🚀 Fluxo Automatizado de Deploy (Frontend)
O deploy do front-end está automatizado diretamente pelo terminal via pacote gh-pages.

Certifique-se de que o caminho base está ajustado no seu vite.config.ts.

Vá até a pasta do frontend e execute:

Bash
cd frontEnd
npm run deploy
O script disparará o predeploy, gerará a compilação estática comprimida na pasta /dist, injetará a URL de produção do Render e atualizará a branch gh-pages no GitHub de forma 100% automatizada.

O site estará disponível em: https://github.com/Bancos-de-Dados-II/projeto-01-ctrl-alt-elite.git