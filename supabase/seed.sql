-- Optional seed data (replace emails with your real team emails)
-- After you invite or auth these emails once, their profiles will exist.
-- For demo purposes, insert tasks pointing to NULL owner until profiles created.

insert into public.tasks (title, description, start_date, due_date, status, progress, owner_id)
values
('BLDG 1300 – full drawing package review', 'Lead the review and QA', '2025-10-15', '2025-10-22', 'In Progress', 45, null),
('Holocom TFR narrative checks', 'Review latest submittal; prep RFIs', '2025-10-20', '2025-10-21', 'In Progress', 20, null),
('Build PLM Dashboard v1', 'Baseline daily tag-up + task tracker', '2025-10-18', '2025-10-25', 'Not Started', 0, null);
