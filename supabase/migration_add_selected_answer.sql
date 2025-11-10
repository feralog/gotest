-- ============================================
-- MIGRATION: Add selected_answer column
-- ============================================
-- This migration adds the selected_answer column to question_stats
-- to track which answer option the user selected for each question

-- Add the selected_answer column
ALTER TABLE public.question_stats
ADD COLUMN IF NOT EXISTS selected_answer INTEGER;

-- Add comment to document the column
COMMENT ON COLUMN public.question_stats.selected_answer IS 'Index of the answer option selected by the user (0-based)';

-- Verify the migration
SELECT 'Migration completed successfully!' as status,
       'Added selected_answer column to question_stats table' as changes;
