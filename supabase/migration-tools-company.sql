-- Add company field to cv_tools so each tool records which company it was used at.
-- This allows AI generation to assign tools accurately to the correct experience roles.

ALTER TABLE public.cv_tools
  ADD COLUMN IF NOT EXISTS company text;
