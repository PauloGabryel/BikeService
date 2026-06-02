# 🚲 BikeService — Sistema de Controle de Manutenções de Bicicletas

Aplicação web para gerenciamento e controle financeiro de manutenções de bicicletas, com autenticação via Supabase e CRUD completo.

## 🚀 Tecnologias

- **React 19** + **Vite** + **TypeScript**
- **Supabase** — Autenticação e banco de dados (PostgreSQL)
- **shadcn/ui** — Componentes de interface (Button, Card, Dialog, Select, Table, AlertDialog, Toast, Badge, Separator)
- **Tailwind CSS v4** — Estilização
- **Lucide React** — Ícones
- **date-fns** — Formatação de datas

## ✨ Funcionalidades

- **Autenticação completa**: Login, Cadastro, Recuperação de senha e Logout via Supabase Auth
- **CRUD de Manutenções**: Criar, Visualizar, Editar e Deletar registros
- **Dashboard com estatísticas**: Total gasto, número de serviços, média por serviço, último serviço
- **Histórico ordenável**: Ordene por data, custo ou tipo de serviço
- **Busca em tempo real**: Filtre por tipo de serviço, local ou observações
- **Cálculo automático do total** gasto com filtro aplicado
- **Responsivo**: Interface adaptada para mobile e desktop
- **Segurança RLS**: Cada usuário só acessa seus próprios dados

## 📋 Campos da Manutenção

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | ID do usuário (FK auth.users) |
| `tipo_servico` | TEXT | Tipo de serviço realizado |
| `data` | DATE | Data do serviço |
| `custo` | NUMERIC | Valor pago pelo serviço |
| `local` | TEXT | Local/oficina onde foi feito |
| `observacoes` | TEXT | Detalhes adicionais (opcional) |
| `created_at` | TIMESTAMPTZ | Data de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data da última atualização |

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/bikeservice.git
cd bikeservice
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Configure o banco de dados no Supabase
No painel do Supabase, acesse o **Editor SQL** e execute o conteúdo do arquivo `supabase-schema.sql`.

Isso irá:
- Criar a tabela `manutencoes`
- Criar índices para performance
- Habilitar o RLS (Row Level Security)
- Criar políticas de segurança por `user_id`
- Criar trigger para `updated_at` automático

### 4. Execute o projeto
```bash
npm run dev
```

## 🌐 Deploy na Vercel

1. Faça push do projeto para o GitHub
2. No painel da Vercel, importe o repositório
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático!

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   └── ManutencaoForm.tsx  # Formulário de criação/edição
├── contexts/
│   └── AuthContext.tsx      # Context de autenticação
├── hooks/
│   └── use-toast.ts         # Hook de notificações
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── utils.ts             # Utilitários (cn)
├── pages/
│   ├── LoginPage.tsx        # Página de login
│   ├── RegisterPage.tsx     # Página de cadastro
│   ├── ResetPasswordPage.tsx # Recuperação de senha
│   └── DashboardPage.tsx    # Dashboard principal + CRUD
├── types/
│   └── index.ts             # Tipos TypeScript
├── App.tsx                  # Componente raiz + roteamento
├── main.tsx                 # Entry point
└── index.css                # Estilos globais + CSS vars shadcn/ui
```

## 🔒 Segurança

- Autenticação gerenciada pelo Supabase Auth
- RLS (Row Level Security) ativo na tabela `manutencoes`
- Cada usuário acessa apenas seus próprios dados
- Chaves do Supabase armazenadas em variáveis de ambiente (`.env`)
- `.env` incluído no `.gitignore`
