-- Migration 001: Add level column to courses table
-- Run this against an existing database that was created before level was added to schema.sql
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT '100'
    CHECK (level IN ('100', '200', '300', '400'));
