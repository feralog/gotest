# Deploy no Vercel - Guia Completo

## Por que Vercel?

O Vercel é perfeito para este projeto porque:
- ✅ **100% Gratuito** para projetos pessoais
- ✅ **Deploy automático** a cada push no GitHub
- ✅ **HTTPS automático** (necessário para Supabase)
- ✅ **CDN global** (site rápido no mundo todo)
- ✅ **Zero configuração** - funciona direto com arquivos estáticos

## Opção 1: Deploy Direto do GitHub (Recomendado)

### Passo 1: Criar conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seu GitHub

### Passo 2: Importar Repositório

1. No dashboard do Vercel, clique em "Add New Project"
2. Selecione "Import Git Repository"
3. Encontre seu repositório `gotest` (ou nome que você deu)
4. Clique em "Import"

### Passo 3: Configurar Projeto

Na tela de configuração:

**Framework Preset:** Deixe como "Other" (site estático)

**Build Settings:**
- **Build Command:** Deixe vazio
- **Output Directory:** Deixe vazio (ou coloque `.`)
- **Install Command:** Deixe vazio

**Root Directory:** `.` (raiz do projeto)

### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguarde ~30 segundos
3. Pronto! Seu site está no ar!

O Vercel vai gerar uma URL tipo:
```
https://gotest.vercel.app
```

ou

```
https://gotest-abc123.vercel.app
```

### Passo 5: Configurar Domínio Personalizado (Opcional)

Se você tiver um domínio próprio:

1. No dashboard do projeto, vá em "Settings" > "Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções do Vercel
4. Aguarde propagação (pode levar até 48h)

## Opção 2: Deploy via CLI (Alternativa)

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Fazer Login

```bash
vercel login
```

### Fazer Deploy

Na pasta do projeto:

```bash
vercel
```

Siga as instruções:
- "Set up and deploy?" → Yes
- "Which scope?" → Sua conta
- "Link to existing project?" → No
- "What's your project's name?" → gotest (ou nome que preferir)
- "In which directory is your code located?" → `./` (enter)

Para deploy de produção:

```bash
vercel --prod
```

## Configuração Pós-Deploy

### Atualizar URL do Supabase

Após fazer deploy, você terá uma URL tipo `https://gotest.vercel.app`.

**IMPORTANTE:** Você precisa adicionar esta URL no Supabase!

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** > **URL Configuration**
3. Em "Site URL", adicione: `https://gotest.vercel.app`
4. Em "Redirect URLs", adicione:
   - `https://gotest.vercel.app`
   - `https://gotest.vercel.app/**`

Isso permite que o Supabase Auth funcione corretamente.

## Deploy Automático

Com o Vercel conectado ao GitHub:

✅ Cada `git push` na branch principal → Deploy automático
✅ Pull requests → Preview deployments automáticos
✅ Rollback fácil para versões anteriores

### Como funciona

1. Você faz alterações no código
2. Commita e faz push:
   ```bash
   git add .
   git commit -m "Nova feature"
   git push origin main
   ```
3. O Vercel detecta automaticamente
4. Faz deploy em ~30 segundos
5. Você recebe uma notificação quando concluir

## Variáveis de Ambiente (Opcional)

Se você quiser esconder as credenciais do Supabase:

### 1. Criar arquivo `.env.local` (local)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-aqui
```

### 2. Adicionar ao `.gitignore`

```
.env.local
```

### 3. Configurar no Vercel

1. Vá em "Settings" > "Environment Variables"
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. Atualizar código

No `js/supabase-config.js`:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-key'
```

**NOTA:** Como estamos usando JavaScript vanilla, você pode pular isso. A `anon` key é pública e segura de estar no código (RLS protege os dados).

## Monitoramento

### Ver Logs de Deploy

1. No dashboard do Vercel, clique no seu projeto
2. Vá na aba "Deployments"
3. Clique em qualquer deployment para ver logs

### Analytics (Opcional)

O Vercel oferece analytics grátis:
1. Vá em "Analytics"
2. Veja visitantes, performance, etc.

## Troubleshooting

### Deploy falhou

- Verifique se não há erros de sintaxe no código
- Veja os logs do deployment no Vercel
- Certifique-se que todos os arquivos estão commitados

### Supabase Auth não funciona

- Verifique se adicionou a URL do Vercel no Supabase (Authentication > URL Configuration)
- Certifique-se que está usando HTTPS (não HTTP)

### Alterações não aparecem

- Faça hard refresh: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
- Limpe cache do navegador
- Aguarde 1-2 minutos para propagação do CDN

### Página 404

- Certifique-se que `index.html` está na raiz do projeto
- Verifique se o deploy completou com sucesso

## Comparação: GitHub Pages vs Vercel

| Feature | GitHub Pages | Vercel |
|---------|--------------|--------|
| Preço | Grátis | Grátis |
| HTTPS | ✅ | ✅ |
| Custom Domain | ✅ | ✅ |
| Deploy Automático | ✅ | ✅ |
| Analytics | ❌ | ✅ |
| Preview Deployments | ❌ | ✅ |
| Rollback Fácil | ❌ | ✅ |
| Serverless Functions | ❌ | ✅ (plano Pro) |

**Recomendação:** Use Vercel pela melhor experiência de deploy e ferramentas.

## Próximos Passos

Depois do deploy:

1. ✅ Teste o site em produção
2. ✅ Crie sua primeira conta
3. ✅ Resolva alguns quizzes
4. ✅ Verifique se o progresso está salvando no Supabase
5. ✅ Compartilhe com colegas!

## Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Deploy com Git](https://vercel.com/docs/git)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

**Pronto!** Seu projeto está no ar! 🚀
