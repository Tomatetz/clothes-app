create extension if not exists pgcrypto;

create table if not exists public.clothes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  brand text not null,
  season text not null check (season in ('summer', 'winter', 'all-season')),
  image_url text not null,
  slots text[] not null check (
    slots <@ array['top', 'outerTop', 'bottom', 'shoes', 'bag']::text[]
    and cardinality(slots) > 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outfit_selections (
  slot text primary key check (slot in ('top', 'outerTop', 'bottom', 'shoes', 'bag')),
  clothing_item_id uuid references public.clothes(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.clothes enable row level security;
alter table public.outfit_selections enable row level security;

insert into storage.buckets (id, name, public)
values ('clothes-images', 'clothes-images', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read clothes images'
  ) then
    create policy "Public can read clothes images"
    on storage.objects for select
    using (bucket_id = 'clothes-images');
  end if;
end $$;
