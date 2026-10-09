-- VCC fan site: run once in the Supabase SQL editor.
-- No public policies: RLS is on and only the server (service role) reads and writes.

create table recipe_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 120),
  place text check (char_length(place) <= 80),
  dish text not null check (char_length(dish) between 2 and 80),
  story text check (char_length(story) <= 1000),
  fav_video text,
  consent boolean not null default false,
  approved boolean not null default false
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text unique not null
);

alter table recipe_submissions enable row level security;
alter table newsletter_subscribers enable row level security;
