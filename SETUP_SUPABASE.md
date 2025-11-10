# Configuração do Supabase - Passo a Passo

## 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub (recomendado)

## 2. Criar Novo Projeto

1. Clique em "New Project"
2. Preencha:
   - **Nome:** GoTest (ou nome que preferir)
   - **Database Password:** Crie uma senha forte e SALVE ela
   - **Region:** South America (São Paulo) - mais próximo do Brasil
   - **Pricing Plan:** Free
3. Clique em "Create new project"
4. Aguarde ~2 minutos enquanto o projeto é criado

## 3. Configurar o Banco de Dados

1. No painel lateral, clique em **SQL Editor**
2. Clique em "+ New Query"
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql` deste repositório
4. Cole no editor SQL
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Você deve ver: "Success. No rows returned"

## 4. Configurar Políticas de Segurança (RLS)

As políticas já estão incluídas no schema.sql, mas vamos verificar:

1. No painel lateral, clique em **Authentication** > **Policies**
2. Verifique se existem políticas para as tabelas:
   - `user_profiles`
   - `user_progress`
   - `question_stats`

Se não aparecerem, execute novamente o schema.sql completo.

## 5. Obter Credenciais da API

1. No painel lateral, clique em **Settings** (⚙️ no canto inferior)
2. Clique em **API**
3. Você verá duas informações importantes:

### Project URL
```
https://seu-projeto-id.supabase.co
```

### API Keys
- **anon/public key:** Esta chave é PÚBLICA (pode ir no código frontend)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

## 6. Configurar o Projeto

1. Abra o arquivo `js/supabase-config.js`
2. Substitua as variáveis:

```javascript
const SUPABASE_URL = 'https://seu-projeto-id.supabase.co'
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui'
```

3. **IMPORTANTE:** Se estiver usando git público:
   - Você PODE commitar a anon key (ela é pública por design)
   - As regras RLS protegem seus dados
   - NUNCA commite a `service_role` key

## 7. Configurar Email de Confirmação (Opcional)

Por padrão, Supabase envia email de confirmação. Para desenvolvimento, você pode desabilitar:

1. Vá em **Authentication** > **Settings**
2. Em "User Signups", desabilite "Enable email confirmations"
3. Salve

## 8. Testar a Aplicação

1. Abra `index.html` no navegador
2. Clique em "Criar conta"
3. Preencha com um email e senha
4. Faça login
5. Resolva algumas questões
6. Feche o navegador e abra novamente
7. Faça login - seu progresso deve estar salvo!

## 9. Verificar Dados no Supabase

1. No Supabase, vá em **Table Editor**
2. Selecione a tabela `user_progress`
3. Você deve ver seus registros de progresso

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a anon key corretamente
- Certifique-se de que não há espaços extras

### Erro: "new row violates row-level security policy"
- Execute o schema.sql novamente
- Verifique se as políticas RLS foram criadas

### Login não funciona
- Verifique o console do navegador (F12)
- Veja se há erros de CORS ou API

### Dados não salvam
- Abra o console (F12) e veja erros
- Verifique se o usuário está autenticado: `supabase.auth.getUser()`

## Custos (Plano Free)

O plano gratuito do Supabase inclui:
- ✅ 500MB de database storage
- ✅ 50,000 usuários ativos por mês
- ✅ 2GB de bandwidth
- ✅ Autenticação ilimitada
- ✅ Row Level Security
- ✅ Realtime (para futuras features)

Isso é MAIS do que suficiente para seu caso de uso!

## Próximos Passos

Depois de configurar o Supabase:
1. Leia `DEPLOY_VERCEL.md` para fazer deploy no Vercel
2. Ou continue usando GitHub Pages (também funciona perfeitamente)
