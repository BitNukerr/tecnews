create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  title text not null,
  summary text not null,
  body text not null default '',
  category text not null,
  author text not null,
  published_at_text text not null,
  image_url text not null,
  image_alt text not null default '',
  gallery_images jsonb not null default '[]'::jsonb,
  section text not null default 'promocoes',
  score text not null default '',
  store text not null default '',
  price text not null default '',
  old_price text not null default '',
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.posts enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage settings" on public.site_settings;
create policy "Admins can manage settings"
on public.site_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts for select
to anon
using (published = true);

drop policy if exists "Admins can read all posts" on public.posts;
create policy "Admins can read all posts"
on public.posts for select
to authenticated
using (true);

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
on public.posts for all
to authenticated
using (true)
with check (true);

insert into public.site_settings (key, value)
values (
  'content',
  '{
    "siteTitle": "Tecnews.pt",
    "newsletterTitle": "Resumo Tecnews",
    "newsletterText": "As novidades úteis de tecnologia, promoções e guias de compra numa newsletter semanal.",
    "showTrends": false,
    "trends": ["iPhone 18", "Galaxy S27", "ChatGPT", "Digi Portugal", "Carros elétricos"],
    "categories": ["IA", "Smartphones", "Gaming", "Oferta", "Portáteis", "Reviews", "Guias", "Promoções"],
    "authors": ["Rafael Matos", "Mariana Lopes", "Diogo Reis", "Inês Gomes", "João Esteves"]
  }'::jsonb
)
on conflict (key) do nothing;

alter table public.posts add column if not exists gallery_images jsonb not null default '[]'::jsonb;
