# 🚀 Getting Started - Plataforma de Estudos com Backend

## Bem-vindo!

Este guia vai te ajudar a configurar sua plataforma de estudos do zero, com backend, autenticação e dados persistentes - **tudo de graça!**

## 📋 O que você vai ter

- ✅ Sistema de login e registro de usuários
- ✅ Progresso salvo na nuvem (Supabase)
- ✅ Continuar de onde parou
- ✅ Estatísticas pessoais de estudo
- ✅ Barra lateral com todas as especialidades
- ✅ Perfil editável (nome, senha)
- ✅ 100% responsivo (mobile + desktop)
- ✅ Deploy grátis no Vercel ou GitHub Pages

## 🎯 Fluxo Completo

1. **Usuário acessa o site** → Tela de login/registro
2. **Faz login** → Vê seleção de especialidades + sidebar
3. **Seleciona quiz** → Resolve questões
4. **Fecha o navegador** → Progresso salvo automaticamente
5. **Volta depois** → Continua exatamente de onde parou

## 📦 Estrutura do Projeto

```
gotest/
├── index.html                 # Arquivo principal
├── css/
│   └── styles.css            # Estilos (incluindo sidebar e auth)
├── js/
│   ├── config.js             # Configuração de especialidades
│   ├── supabase-config.js    # Configuração do Supabase (VOCÊ VAI EDITAR)
│   ├── auth.js               # Lógica de autenticação
│   ├── data.js               # Gerenciamento de dados
│   └── app.js                # Lógica principal do app
├── subjects/                  # Questões organizadas por especialidade
├── supabase/
│   └── schema.sql            # Schema do banco de dados
├── SETUP_SUPABASE.md         # Guia de configuração do Supabase
├── DEPLOY_VERCEL.md          # Guia de deploy no Vercel
└── GETTING_STARTED.md        # Este arquivo
```

## 🔧 Setup em 3 Passos

### Passo 1: Configurar o Supabase

O Supabase é o backend gratuito que vai armazenar os dados dos usuários.

**Tempo estimado:** 10 minutos

1. Leia o arquivo [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)
2. Siga TODOS os passos do guia
3. Anote suas credenciais (URL e ANON_KEY)

**Resumo rápido:**
- Criar conta no Supabase
- Criar novo projeto
- Executar `supabase/schema.sql` no SQL Editor
- Copiar credenciais

### Passo 2: Configurar as Credenciais

1. Abra o arquivo `js/supabase-config.js`

2. Substitua as credenciais:

```javascript
const SUPABASE_URL = 'https://seu-projeto-id.supabase.co'  // ← Substituir aqui
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui'              // ← Substituir aqui
```

3. Salve o arquivo

### Passo 3: Testar Localmente

1. Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge)

2. Você deve ver a tela de login/registro

3. Crie uma conta de teste

4. Faça login e teste:
   - Seleção de especialidade
   - Resolver algumas questões
   - Fechar e reabrir o navegador
   - Login novamente → progresso deve estar salvo!

## 🚀 Deploy (Publicar Online)

Depois de testar localmente, publique seu site:

### Opção 1: Vercel (Recomendado)

**Vantagens:** Deploy automático, HTTPS, analytics, rollback fácil

Leia o guia completo: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

**Resumo rápido:**
1. Conecte sua conta GitHub ao Vercel
2. Importe o repositório
3. Clique em "Deploy"
4. Pronto! Site no ar em ~30 segundos

### Opção 2: GitHub Pages

**Vantagens:** Simples, integrado com GitHub

```bash
# 1. Certifique-se que está na branch correta
git checkout main

# 2. Vá em Settings > Pages
# 3. Source: Deploy from a branch
# 4. Branch: main, folder: / (root)
# 5. Save

# Seu site estará em: https://seu-usuario.github.io/gotest
```

**IMPORTANTE:** Depois do deploy, adicione a URL no Supabase (Authentication > URL Configuration).

## 🎨 Customização

### Mudar o Título

Edite `js/config.js`:

```javascript
const quizConfig = {
    title: "Minha Plataforma de Estudos",  // ← Seu título aqui
    // ...
}
```

### Adicionar Nova Especialidade

1. Crie pasta em `subjects/NomeEspecialidade/`
2. Adicione JSONs de questões
3. Edite `js/config.js` e adicione a nova especialidade
4. Adicione botão na sidebar em `index.html`

### Mudar Cores

Edite `css/styles.css`:

```css
/* Cor principal */
.card-header {
    background: #2563eb !important; /* Azul - mude aqui */
}

/* Sidebar */
.sidebar {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}
```

## 📊 Banco de Dados

O Supabase cria 3 tabelas automaticamente:

### 1. `user_profiles`
Armazena informações do usuário:
- `username` - Nome de usuário único
- `display_name` - Nome completo para exibição
- `created_at` - Data de criação

### 2. `user_progress`
Armazena progresso em cada módulo:
- `specialty`, `subcategory`, `module_id` - Identificação do módulo
- `current_question_index` - Próxima questão a responder
- `questions_completed` - Questões respondidas pelo menos 1x
- `completion_percentage` - 0 a 100%

### 3. `question_stats`
Estatísticas detalhadas por questão:
- `times_seen` - Quantas vezes viu a questão
- `times_correct` - Quantas acertou
- `times_incorrect` - Quantas errou
- `last_answer_correct` - Acertou ou errou na última vez

Todas as tabelas têm **Row Level Security (RLS)** ativado - cada usuário só vê seus próprios dados!

## 🔒 Segurança

### É seguro?

✅ **SIM!** O Supabase implementa:
- **Row Level Security (RLS)** - usuários só acessam seus dados
- **Autenticação JWT** - tokens criptografados
- **HTTPS obrigatório** - comunicação criptografada
- **Anon key é pública** - projetada para ser exposta no frontend

### Posso commitar as credenciais?

✅ **SIM para a ANON_KEY** - ela é pública por design
❌ **NUNCA commite a SERVICE_ROLE KEY** - essa é privada

A `anon` key que você coloca no código é segura porque:
1. Só funciona em conjunto com RLS (row level security)
2. Cada usuário só acessa seus próprios dados
3. Supabase foi projetado assim

## 🐛 Troubleshooting

### "Erro ao fazer login"

- Verifique se as credenciais do Supabase estão corretas em `js/supabase-config.js`
- Abra o console (F12) e veja detalhes do erro
- Certifique-se que executou o `schema.sql` no Supabase

### "Progresso não está salvando"

- Abra o console (F12) e procure por erros
- Verifique se está logado (botão de perfil deve aparecer)
- Vá no Supabase > Table Editor > `user_progress` e veja se há dados

### "Tela branca / Nada aparece"

- Abra o console (F12) e veja erros
- Verifique se todos os arquivos JS estão carregando
- Certifique-se que não há erros de sintaxe

### "Não consigo criar conta"

- Verifique email e senha (mínimo 6 caracteres)
- Se habilitou confirmação de email no Supabase, desabilite para testes
- Veja o console (F12) para detalhes do erro

## 📈 Próximos Passos

Depois que tudo estiver funcionando:

### Features Futuras que Você Pode Adicionar:

1. **Modo Escuro** - Toggle de tema claro/escuro
2. **Relatórios de Progresso** - Gráficos de evolução
3. **Compartilhar Resultados** - Social share
4. **Ranking** - Comparar com outros usuários
5. **Modo Revisão** - Revisar apenas questões erradas
6. **Timer por Questão** - Cronometrar tempo de resposta
7. **Notificações** - Lembrete para estudar
8. **Metas de Estudo** - Definir metas diárias/semanais

### Melhorias de UI:

1. **Animações** - Transições suaves entre telas
2. **Confetti** - Comemorar ao completar 100%
3. **Progress Rings** - Gráficos circulares de progresso
4. **Badges** - Conquistas desbloqueáveis
5. **Temas Coloridos** - Cor por especialidade

## 🆘 Suporte

Se tiver problemas:

1. Releia este guia
2. Verifique os guias específicos:
   - [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)
   - [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
3. Veja o console do navegador (F12) para erros
4. Verifique os logs do Supabase

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Bootstrap Docs](https://getbootstrap.com/docs/5.3)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✅ Checklist de Setup

Use esta checklist para garantir que fez tudo:

- [ ] Criei conta no Supabase
- [ ] Criei novo projeto no Supabase
- [ ] Executei o `schema.sql` no SQL Editor
- [ ] Copiei URL e ANON_KEY do Supabase
- [ ] Atualizei `js/supabase-config.js` com minhas credenciais
- [ ] Testei localmente e consegui criar uma conta
- [ ] Testei fazer login
- [ ] Testei resolver questões
- [ ] Verifiquei que o progresso salvou
- [ ] Fiz deploy no Vercel ou GitHub Pages
- [ ] Adicionei URL de produção no Supabase (Authentication > URL Configuration)
- [ ] Testei o site em produção

---

**Parabéns!** 🎉 Você agora tem uma plataforma de estudos profissional, com backend, autenticação e tudo funcionando!

Bons estudos! 📚✨
