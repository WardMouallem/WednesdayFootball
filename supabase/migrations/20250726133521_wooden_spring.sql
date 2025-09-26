/*
  # Create app data table for Wednesday Football

  1. New Tables
    - `app_data`
      - `id` (text, primary key) - data type identifier
      - `data` (jsonb) - the actual data content
      - `updated_at` (timestamp) - when data was last updated
      - `version` (integer) - version number for conflict resolution

  2. Security
    - Enable RLS on `app_data` table
    - Add policy for all users to read and write data
*/

CREATE TABLE IF NOT EXISTS app_data (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Allow all users to read and write app data
CREATE POLICY "Anyone can read app data"
  ON app_data
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert app data"
  ON app_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update app data"
  ON app_data
  FOR UPDATE
  USING (true);

-- Create function to automatically update timestamp and version
CREATE OR REPLACE FUNCTION update_app_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp and version
CREATE TRIGGER update_app_data_timestamp_trigger
  BEFORE UPDATE ON app_data
  FOR EACH ROW
  EXECUTE FUNCTION update_app_data_timestamp();