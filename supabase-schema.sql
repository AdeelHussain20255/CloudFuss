-- CloudFuse Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon text not null,
  created_at timestamptz default now()
);

-- Files table
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  size bigint not null,
  category_id uuid references categories(id),
  category_name text,
  mega_url text not null,
  user_name text not null default 'Anonymous',
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_files_category_id on files(category_id);
create index if not exists idx_files_category_name on files(category_name);
create index if not exists idx_files_created_at on files(created_at desc);

-- Enable Row Level Security
alter table categories enable row level security;
alter table files enable row level security;

-- Public read access for files
create policy "Public read files" on files
  for select using (true);

-- Public insert access for files
create policy "Public insert files" on files
  for insert with check (true);

-- Public read access for categories
create policy "Public read categories" on categories
  for select using (true);

-- Public insert access for categories
create policy "Public insert categories" on categories
  for insert with check (true);

-- Enable realtime for files table
alter publication supabase_realtime add table files;

-- Insert default categories
insert into categories (name, icon) values
  ('Notes', '📝'),
  ('Certificates', '🎓'),
  ('Past Papers', '📄'),
  ('CS Stuff', '💻')
on conflict (name) do nothing;