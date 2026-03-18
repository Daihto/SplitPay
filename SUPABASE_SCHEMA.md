# Supabase Schema for SplitPay

This app now persists groups, memberships, expenses, and activity to Supabase.

## Required Tables

### 1) `profiles`
Stores user profile information linked to Supabase auth.

Columns:
- `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `username` TEXT UNIQUE NOT NULL
- `email` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()

### 2) `groups`
Stores group metadata.

Columns:
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `created_by` UUID REFERENCES auth.users(id)
- `created_at` TIMESTAMPTZ

### 3) `group_members`
Tracks which users belong to which groups.

Columns:
- `id` BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY (optional)
- `group_id` TEXT REFERENCES groups(id)
- `user_id` UUID REFERENCES auth.users(id)

### 4) `expenses`
Tracks group expenses. The app assumes the following fields:
- `id` TEXT PRIMARY KEY
- `group_id` TEXT REFERENCES groups(id)
- `description` TEXT
- `amount` NUMERIC
- `paid_by` UUID REFERENCES auth.users(id)
- `split_among` UUID[] (array of user IDs)
- `date` TIMESTAMPTZ
- `is_settled` BOOLEAN
- `settled_at` TIMESTAMPTZ
- `is_settlement` BOOLEAN

### 5) `activities`
Stores activity log entries per user.

Columns:
- `id` TEXT PRIMARY KEY
- `user_id` UUID REFERENCES auth.users(id)
- `message` TEXT
- `date` TIMESTAMPTZ

## Notes
- The client uses the Supabase JS client in `src/supabaseClient.js`.
- If the tables are missing or have mismatched columns, the app may log errors in the browser console.
- You can create these tables using the Supabase SQL editor.
- Enable Row Level Security (RLS) on tables for security, with policies allowing users to access only their own data.
