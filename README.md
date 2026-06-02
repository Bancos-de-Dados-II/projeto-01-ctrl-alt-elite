# 🏫 ConectaEnsino - Plataforma de Inclusão Educacional

**Status do Projeto:** Frontend & Backend Concluídos e Operacionais em Produção 🚀

O **ConectaEnsino** é uma plataforma de impacto social com foco na inclusão educacional, projetada para mapear e georreferenciar escolas acessíveis na região do Sertão Paraibano.

O sistema calcula distâncias geográficas em tempo real a partir da localização do usuário, aplicando regras estritas de acessibilidade para conectar alunos e monitorias a polos educacionais adaptados.

---

# 🗺️ Arquitetura de Deploy (Produção)

A plataforma adota uma arquitetura desacoplada para otimização de custos e performance:

### Frontend
Hospedado de forma estática no GitHub Pages com compilação otimizada pelo Vite.

### Backend & Banco de Dados
Servidor RESTful hospedado no Render, comunicando-se com instâncias relacionais no Supabase e realizando queries espaciais.

---

# 📂 Estrutura do Repositório Monorepo

```plaintext
projeto-01-ctrl-alt-elite/
├── package.json             # 🎛️ Script global de automação e instalação
├── backEnd/                 # API RESTful (Hospedado no Render)
│   ├── src/
│   │   ├── config/          # Conexão Singleton de segurança com o Supabase
│   │   ├── controllers/     # Regras de filtragem, JOINs e lógica de negócio
│   │   ├── routes/          # Mapeamento dos endpoints HTTP
│   │   └── server.ts        # Ponto de entrada do servidor Express
│   └── package.json         # Dependências do servidor
│
└── frontEnd/                # Aplicação SPA React (Hospedado no GitHub Pages)
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── services/        # Cliente de API via Axios
    │   ├── Mapa.tsx         # Núcleo do mapa e filtros geográficos
    │   └── Mapa.module.css  # Estilização via CSS Modules
    ├── .env.production      # URL da API em produção
    ├── vite.config.ts       # Configuração do GitHub Pages
    └── package.json         # Scripts de deploy
```

---

# 🛠️ Tecnologias Utilizadas

## Backend (`backEnd/package.json`)

- **Node.js + TypeScript** – Ambiente de execução e tipagem estática.
- **Express** – Framework para construção da API REST.
- **Cors (^2.8.5)** – Permite requisições seguras do frontend.
- **Supabase JS Client (^2.43.0)** – Integração com PostgreSQL e PostGIS.

## Frontend (`frontEnd/package.json`)

- **React (^18.x)** – Biblioteca para interfaces.
- **Vite** – Ferramenta de build rápida.
- **Leaflet (^1.9.4)** – Biblioteca de mapas.
- **React-Leaflet (^4.2.1)** – Integração do Leaflet com React.
- **Axios (^1.6.8)** – Cliente HTTP.
- **React Icons (^5.2.1)** – Biblioteca de ícones.
- **gh-pages (^6.1.1)** – Automação de deploy no GitHub Pages.

---

# ⚡ Instalação Rápida Monorepo

Graças ao gerenciador global configurado na raiz do projeto, não é necessário instalar dependências separadamente.

## 1. Instalar todas as dependências

Na raiz do projeto, execute:

```bash
npm run install-all
```

Esse comando instalará simultaneamente as dependências do Backend e do Frontend.

---

## 2. Executar o projeto

### Iniciar o Backend

```bash
npm run dev-back
```

### Iniciar o Frontend

```bash
npm run dev-front
```

---

# ⚙️ Configuração das Variáveis de Ambiente

## Backend (`/backEnd/.env`)

```env
PORT=3000
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_KEY=sua_chave_anon_aqui
```

## Frontend (`/frontEnd/.env.production`)

```env
VITE_API_URL=https://api-conecta-ensino.onrender.com
```

---

# 📡 Documentação da API

## 1. Listagem Geral de Escolas

Retorna a lista de escolas cadastradas.

**Método:** `GET`

**Rota:**

```http
/escolas
```

### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| municipio | string | Filtra pelo nome exato da cidade |
| pcd | boolean | Filtra escolas com acessibilidade total |

### Regra de Negócio

O filtro `pcd=true` exige validação simultânea de:

- `acesso_total`
- `tem_rampa`
- `tem_banheiro_pcd`

O limite de segurança por consulta é de **2000 registros**.

---

## 2. Escolas Próximas

Realiza cálculos geográficos com base na localização atual do usuário.

**Método:** `GET`

**Rota:**

```http
/escolas/proximas
```

### Query Parameters

| Parâmetro | Tipo |
|-----------|------|
| lat | float |
| lng | float |
| raio | float (opcional, padrão 10 km) |

---

# 🚀 Deploy do Frontend

O deploy está automatizado através do pacote **gh-pages**.

Certifique-se de que o caminho base está configurado corretamente em `vite.config.ts`.

Entre na pasta do frontend:

```bash
cd frontEnd
```

Execute:

```bash
npm run deploy
```

O script irá:

1. Executar o build da aplicação.
2. Gerar os arquivos otimizados na pasta `dist`.
3. Atualizar automaticamente a branch `gh-pages`.
4. Publicar a nova versão no GitHub Pages.

---

# 🌐 Repositório

GitHub:

https://github.com/Bancos-de-Dados-II/projeto-01-ctrl-alt-elite

---
