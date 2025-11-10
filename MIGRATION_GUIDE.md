# 🔄 Migration Guide - Add Question Answer Persistence

## What Changed?

The system now saves **which specific answer** each user selected for every question, not just the current position. When users return to a quiz, they'll see:
- ✅ The exact question where they stopped
- ✅ All previously answered questions marked as "answered"
- ✅ Their selected answers already highlighted

## Required Database Migration

You need to add a new column to your Supabase database to enable this feature.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Migration

Copy and paste this SQL command:

```sql
-- Add selected_answer column to question_stats table
ALTER TABLE public.question_stats
ADD COLUMN IF NOT EXISTS selected_answer INTEGER;

-- Add comment to document the column
COMMENT ON COLUMN public.question_stats.selected_answer IS 'Index of the answer option selected by the user (0-based)';
```

### Step 3: Execute

Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see: **Success. No rows returned**

### Step 4: Verify

Run this query to verify the column was added:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'question_stats'
  AND column_name = 'selected_answer';
```

You should see:
```
column_name      | data_type
-----------------+-----------
selected_answer  | integer
```

## That's It!

The migration is complete. Now when users:
1. Answer questions → Each answer is saved to Supabase
2. Leave the quiz → Their progress AND answers are saved
3. Return later → The system loads their exact position AND all their previous answers

## Testing

1. Start a quiz and answer a few questions
2. Close the browser or navigate away
3. Come back and click the same module
4. You should see:
   - Dialog asking if you want to continue
   - Previously answered questions marked with a colored dot
   - Selected answers already highlighted when you navigate to those questions

## Technical Details

### Files Modified:
- ✅ `js/app.js` - Integrated answer saving and loading
- ✅ `js/progress-sync.js` - Added saveQuestionAnswer() and loadUserAnswers()
- ✅ `js/supabase-config.js` - Updated to save selected_answer field
- ✅ `supabase/migration_add_selected_answer.sql` - Migration script (for reference)

### Database Changes:
- ✅ `question_stats.selected_answer` (INTEGER) - Stores the index of the selected answer (0, 1, 2, or 3)

### How It Works:

**When user selects an answer:**
```javascript
// app.js saves it immediately
saveQuestionAnswer(specialty, subcategory, moduleId, questionIndex, selectedAnswer, isCorrect)
```

**When user continues a quiz:**
```javascript
// app.js loads all previous answers
userAnswers = await loadUserAnswers(specialty, subcategory, moduleId)
// Returns: {0: 2, 1: 0, 3: 1, ...} - question index → selected answer index
```

**What gets saved per question:**
- `question_index` - Which question (0, 1, 2, ...)
- `selected_answer` - Which option they chose (0, 1, 2, 3)
- `times_seen` - How many times they've seen this question
- `times_correct` - How many times they answered correctly
- `times_incorrect` - How many times they answered incorrectly
- `last_answer_correct` - Was their last answer correct?

---

**Need help?** Check the browser console for any error messages. All functions log their progress with ✅ success or ❌ error indicators.
