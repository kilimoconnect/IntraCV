-- Add career_category to cv_personal_info so CV Builder's detection is
-- persisted and CV Studio can read it directly instead of recomputing.
alter table cv_personal_info
  add column if not exists career_category text
    check (career_category in ('junior', 'mid-senior', 'executive'));
