create table if not exists page_progress (
  user_id text not null,
  slug text not null,
  done boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create index if not exists page_progress_user_id_idx on page_progress (user_id);
