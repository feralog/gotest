# 🔧 Troubleshooting - Persistência de Respostas

## Passo 1: Executar a Migration no Supabase

**IMPORTANTE**: Este passo é OBRIGATÓRIO. Sem ele, as respostas não serão salvas.

### 1.1. Acesse o Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** na barra lateral esquerda

### 1.2. Execute o SQL
Clique em **New query** e cole este comando:

```sql
-- Adicionar coluna selected_answer à tabela question_stats
ALTER TABLE public.question_stats
ADD COLUMN IF NOT EXISTS selected_answer INTEGER;

-- Verificar se foi criada com sucesso
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'question_stats'
ORDER BY ordinal_position;
```

### 1.3. Clique em Run (ou Ctrl+Enter)

Você deve ver a lista de colunas da tabela `question_stats`, incluindo `selected_answer`.

---

## Passo 2: Limpar o Cache e Recarregar

1. Abra o DevTools (F12)
2. Clique com botão direito no botão de **Reload**
3. Selecione **Empty Cache and Hard Reload** (ou Ctrl+Shift+R)

---

## Passo 3: Testar o Sistema com Console Aberto

### 3.1. Abra o Console do navegador (F12)

Você deve ver ao carregar a página:

```
✅ Progress Sync carregado com sucesso!
   Funções disponíveis:
   - loadProgressFromSupabase()
   - saveProgressToSupabase()
   - autoSaveProgress()
   - saveQuestionAnswer()
   - loadUserAnswers()
   - askContinueOrRestart()
```

### 3.2. Faça Login

Você deve ver:
```
✅ Usuário autenticado: seu@email.com
```

### 3.3. Inicie um Quiz

Quando iniciar um quiz, você deve ver:
```
🔍 Carregando progresso: go/avc1/anatomia
ℹ️ Nenhum progresso salvo encontrado
🆕 Iniciando quiz do zero
```

### 3.4. Responda uma Questão

Quando clicar em uma opção, você deve ver:
```
📝 Q1: Usuário selecionou opção 2
💾 Salvando resposta no Supabase...
💾 Salvando resposta: Q1 = Opção 2 (CORRETA)
   └─ Stats: {timesSeen: 1, timesCorrect: 1, timesIncorrect: 0, lastAnswerCorrect: true, selectedAnswer: 2}
   ✅ Resposta da Q1 salva com sucesso
```

### 3.5. Navegue para Próxima Questão e Responda

Repita o processo para 2-3 questões.

### 3.6. Saia e Volte ao Quiz

1. Volte para a tela inicial
2. Entre no mesmo módulo novamente

Você deve ver:

```
🔍 Carregando progresso: go/avc1/anatomia
✅ Progresso encontrado: {questaoAtual: 3, totalQuestoes: 20, questoesRespondidas: 2, percentual: '10%'}
```

E o dialog perguntando se quer continuar.

### 3.7. Clique em OK para Continuar

Você deve ver:

```
✅ Continuando do progresso salvo - Questão 3
🔄 Carregando respostas anteriores...
🔍 Carregando respostas salvas: go/avc1/anatomia
   ├─ Q1: Opção 2
   ├─ Q2: Opção 0
✅ 2 respostas carregadas
   Respostas: {0: 2, 1: 0}
📊 userAnswers carregado: {0: 2, 1: 0}
   Total de respostas: 2
```

### 3.8. A Questão Atual Deve Mostrar

Quando carregar a primeira questão:
```
🔵 Q1 já foi respondida: Opção 2
   Total de botões encontrados: 4
   ✅ Botão 2 marcado como selecionado
```

**E o botão da opção 2 deve estar destacado!**

---

## Diagnóstico de Problemas

### ❌ Erro: "column 'selected_answer' does not exist"

**Problema**: A migration não foi executada

**Solução**: Volte ao Passo 1 e execute a migration SQL no Supabase

---

### ❌ Mensagem: "⚠️ Não autenticado - resposta não será salva"

**Problema**: Usuário não está logado ou sessão expirou

**Solução**:
1. Faça logout
2. Faça login novamente
3. Tente responder uma questão

---

### ❌ Mensagem: "⚠️ saveQuestionAnswer não disponível"

**Problema**: O arquivo progress-sync.js não foi carregado

**Solução**:
1. Verifique se o arquivo `/js/progress-sync.js` existe
2. Verifique no HTML se o script está sendo carregado:
   ```html
   <script src="js/progress-sync.js"></script>
   ```
3. Limpe o cache e recarregue (Ctrl+Shift+R)

---

### ❌ Respostas Salvas Mas Não Carregadas

**Problema**: Pode haver um erro na função loadUserAnswers

**Solução**:
1. Abra o Console
2. Execute manualmente:
   ```javascript
   loadUserAnswers('go', 'avc1', 'anatomia')
   ```
3. Veja se retorna as respostas ou um erro

---

### ❌ Respostas Não Aparecem Destacadas

**Problema**: Pode haver um problema com o CSS ou timing

**Solução**:
1. Verifique no console se aparece "🔵 Q1 já foi respondida"
2. Verifique se aparece "✅ Botão X marcado como selecionado"
3. Se sim, mas o botão não está destacado, pode ser problema de CSS
4. Inspecione o botão no DevTools e veja se tem a classe `selected`

---

## Verificação Manual no Supabase

### Verificar se as Respostas Estão Sendo Salvas

1. Vá para Supabase Dashboard
2. Clique em **Table Editor**
3. Selecione a tabela `question_stats`
4. Você deve ver registros com:
   - `user_id`: seu ID de usuário
   - `specialty`: 'go', 'cardiopneumo', etc.
   - `module_id`: 'anatomia', 'embrio', etc.
   - `question_index`: 0, 1, 2, ...
   - **`selected_answer`: 0, 1, 2, ou 3** ← Este é o campo importante!

Se o campo `selected_answer` está NULL ou não existe, a migration não foi executada.

---

## Teste Completo Passo a Passo

1. ✅ Migration executada no Supabase
2. ✅ Cache limpo e página recarregada
3. ✅ Login feito com sucesso
4. ✅ Quiz iniciado
5. ✅ Console mostra "💾 Salvando resposta: Q1 = Opção X"
6. ✅ Console mostra "✅ Resposta da Q1 salva com sucesso"
7. ✅ Responder 2-3 questões
8. ✅ Sair do quiz (voltar para home)
9. ✅ Entrar no mesmo módulo novamente
10. ✅ Dialog pergunta se quer continuar
11. ✅ Clicar OK
12. ✅ Console mostra "🔍 Carregando respostas salvas..."
13. ✅ Console mostra "✅ 2 respostas carregadas"
14. ✅ Console mostra "📊 userAnswers carregado: {0: 2, 1: 0}"
15. ✅ Ao carregar questão 1: "🔵 Q1 já foi respondida: Opção 2"
16. ✅ Ao carregar questão 1: "✅ Botão 2 marcado como selecionado"
17. ✅ **O botão da opção 2 está visivelmente destacado na tela**

---

## Ainda Não Funciona?

Se após seguir TODOS os passos acima ainda não funcionar:

1. Copie TODO o output do console (desde o carregamento da página até tentar continuar um quiz)
2. Tire um screenshot da aba Network do DevTools mostrando as chamadas para o Supabase
3. Tire um screenshot da tabela `question_stats` no Supabase
4. Envie essas informações para debug

---

## Comandos Úteis para Debug no Console

```javascript
// Ver estado atual
console.log('AuthState:', AuthState)
console.log('userAnswers:', userAnswers)
console.log('currentQuestionIndex:', currentQuestionIndex)

// Testar função de salvar
saveQuestionAnswer('go', 'avc1', 'anatomia', 0, 2, true)

// Testar função de carregar
loadUserAnswers('go', 'avc1', 'anatomia').then(answers => console.log('Respostas:', answers))

// Verificar se funções existem
console.log('saveQuestionAnswer existe?', typeof saveQuestionAnswer)
console.log('loadUserAnswers existe?', typeof loadUserAnswers)
```
