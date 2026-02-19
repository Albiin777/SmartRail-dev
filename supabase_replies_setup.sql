-- =====================================================
-- COMPLAINT REPLIES TABLE SETUP
-- =====================================================
-- This script creates the complaint_replies table and sets up
-- Row Level Security policies for the reply feature

-- Create the complaint_replies table
CREATE TABLE IF NOT EXISTS complaint_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  marks_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by complaint_id
CREATE INDEX IF NOT EXISTS idx_complaint_replies_complaint_id 
ON complaint_replies(complaint_id);

-- Create index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_complaint_replies_created_at 
ON complaint_replies(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE complaint_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view replies on their own complaints
CREATE POLICY "Users can view replies on their complaints"
  ON complaint_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = complaint_replies.complaint_id 
      AND complaints.user_id = auth.uid()
    )
  );

-- Policy: Users can create replies on their own complaints
CREATE POLICY "Users can reply to their complaints"
  ON complaint_replies FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = complaint_replies.complaint_id 
      AND complaints.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own replies (optional - for editing messages)
CREATE POLICY "Users can update their own replies"
  ON complaint_replies FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own replies (optional)
CREATE POLICY "Users can delete their own replies"
  ON complaint_replies FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- TRIGGER: Auto-update complaint status when resolved
-- =====================================================

-- Function to update complaint status when marked resolved
CREATE OR REPLACE FUNCTION update_complaint_status_on_resolve()
RETURNS TRIGGER AS $$
BEGIN
  -- If a reply marks the complaint as resolved, update the complaint status
  IF NEW.marks_resolved = TRUE THEN
    UPDATE complaints 
    SET 
      status = 'resolved', 
      updated_at = NOW()
    WHERE id = NEW.complaint_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after insert on complaint_replies
DROP TRIGGER IF EXISTS on_reply_marks_resolved ON complaint_replies;
CREATE TRIGGER on_reply_marks_resolved
  AFTER INSERT ON complaint_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_status_on_resolve();

-- =====================================================
-- AUTOMATIC ADMIN ACKNOWLEDGMENT
-- =====================================================

-- Function to create automatic admin acknowledgment
CREATE OR REPLACE FUNCTION create_auto_admin_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert an automatic admin acknowledgment reply
  INSERT INTO complaint_replies (
    complaint_id,
    user_id,
    message,
    is_admin_reply,
    marks_resolved,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id, -- Using same user_id for simplicity
    'Thank you for reaching out! Your request has been submitted successfully. Our support team is reviewing your case and will get back to you shortly.',
    TRUE, -- is_admin_reply
    FALSE, -- marks_resolved
    NEW.created_at -- Same timestamp as complaint creation
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after complaint insert
DROP TRIGGER IF EXISTS on_complaint_create_auto_reply ON complaints;
CREATE TRIGGER on_complaint_create_auto_reply
  AFTER INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION create_auto_admin_reply();

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_complaint_replies_updated_at ON complaint_replies;
CREATE TRIGGER update_complaint_replies_updated_at
  BEFORE UPDATE ON complaint_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE!
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- All tables, policies, and triggers will be created
