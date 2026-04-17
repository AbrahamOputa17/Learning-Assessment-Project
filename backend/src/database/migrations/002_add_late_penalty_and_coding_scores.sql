-- Migration 002: Add deadline/ca_weight to coding_questions,
--                is_late/late_penalty to code_submissions,
--                and create coding_scores table.
-- Run this against an existing database created before these columns were added to schema.sql.

ALTER TABLE coding_questions
  ADD COLUMN IF NOT EXISTS deadline  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ca_weight NUMERIC(5,2) NOT NULL DEFAULT 0;

ALTER TABLE code_submissions
  ADD COLUMN IF NOT EXISTS is_late     BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS late_penalty NUMERIC(5,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS coding_scores (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coding_question_id UUID NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
  raw_score          NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score        NUMERIC(5,2) NOT NULL DEFAULT 0,
  ca_contribution    NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, coding_question_id)
);

CREATE INDEX IF NOT EXISTS idx_coding_scores_user     ON coding_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_scores_question ON coding_scores(coding_question_id);
