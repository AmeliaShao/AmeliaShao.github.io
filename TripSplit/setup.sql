-- TripSplit Lite: intentionally low-security friends-only username access.
-- Run ONCE in a NEW Supabase project's SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.trip_rooms (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 owner_name text not null,
 data jsonb not null,
 version bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint data_object check (jsonb_typeof(data)='object')
);
create index if not exists trip_rooms_members_gin on public.trip_rooms using gin ((data->'members'));
alter table public.trip_rooms enable row level security;
revoke all on public.trip_rooms from anon, authenticated;
-- The three RPCs below intentionally implement username-only access.
create or replace function public.trip_create(p_name text,p_base text,p_username text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code text; v_id uuid := gen_random_uuid(); v_member uuid := gen_random_uuid(); v_data jsonb; i int := 0;
begin
 p_username:=trim(p_username); p_name:=trim(p_name); p_base:=upper(trim(p_base));
 if length(p_username) not between 1 and 30 or length(p_name) not between 1 and 100 or p_base !~ '^[A-Z]{3}$' then raise exception 'Invalid room details'; end if;
 loop
  v_code:=upper(encode(gen_random_bytes(6),'hex'));
  exit when not exists(select 1 from public.trip_rooms where code=v_code);
  i:=i+1; if i>5 then raise exception 'Code generation failed'; end if;
 end loop;
 v_data:=jsonb_build_object('id',v_id,'name',p_name,'base',p_base,'archived',false,'members',jsonb_build_array(jsonb_build_object('id',v_member,'name',p_username)),'expenses','[]'::jsonb,'settlements','[]'::jsonb,'rates',jsonb_build_object(p_base,1),'logs',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'at',now(),'text','创建旅行房间')));
 insert into public.trip_rooms(id,code,owner_name,data) values(v_id,v_code,p_username,v_data);
 return jsonb_build_object('room',v_data,'code',v_code,'version',1);
end $$;
create or replace function public.trip_list(p_username text)
returns jsonb language sql security definer set search_path = '' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'code',code,'name',data->>'name','version',version,'archived',data->'archived') order by updated_at desc),'[]'::jsonb)
 from public.trip_rooms where exists(select 1 from jsonb_array_elements(data->'members') m where lower(trim(m->>'name'))=lower(trim(p_username)));
$$;
create or replace function public.trip_load(p_code text)
returns jsonb language sql security definer set search_path = '' as $$
 select jsonb_build_object('room',data,'code',code,'version',version) from public.trip_rooms where code=upper(trim(p_code)) limit 1;
$$;
create or replace function public.trip_save(p_code text,p_username text,p_version bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_old public.trip_rooms%rowtype; v_members jsonb; v_new jsonb;
begin
 select * into v_old from public.trip_rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'Room not found'; end if;
 if v_old.version<>p_version then raise exception 'VERSION_CONFLICT'; end if;
 if not exists(select 1 from jsonb_array_elements(v_old.data->'members') m where lower(trim(m->>'name'))=lower(trim(p_username))) then raise exception 'Not a room member'; end if;
 if p_data->>'id' <> v_old.id::text or p_data->>'base' <> v_old.data->>'base' then raise exception 'Cannot change room identity or base currency'; end if;
 if jsonb_typeof(p_data->'members')<>'array' or jsonb_typeof(p_data->'expenses')<>'array' or jsonb_typeof(p_data->'settlements')<>'array' or jsonb_typeof(p_data->'logs')<>'array' or pg_column_size(p_data)>500000 then raise exception 'Invalid or oversized room data'; end if;
 if coalesce((v_old.data->>'archived')::boolean,false) and p_data<>v_old.data and coalesce((p_data->>'archived')::boolean,false) then raise exception 'Archived room is read only'; end if;
 -- Preserve existing member IDs; username-only model does not provide stronger authorization.
 if exists(select 1 from jsonb_array_elements(v_old.data->'members') m where not exists(select 1 from jsonb_array_elements(p_data->'members') n where n->>'id'=m->>'id')) then raise exception 'Existing members cannot be removed'; end if;
 update public.trip_rooms set data=p_data,version=version+1,updated_at=now() where id=v_old.id returning version into v_old.version;
 return jsonb_build_object('version',v_old.version);
end $$;
create or replace function public.trip_join(p_code text,p_username text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_old public.trip_rooms%rowtype; v_data jsonb;
begin
 p_username:=trim(p_username);
 if length(p_username) not between 1 and 30 then raise exception 'Invalid username'; end if;
 select * into v_old from public.trip_rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'Invalid invitation code'; end if;
 if coalesce((v_old.data->>'archived')::boolean,false) then raise exception 'Room archived'; end if;
 v_data:=v_old.data;
 if not exists(select 1 from jsonb_array_elements(v_data->'members') m where lower(trim(m->>'name'))=lower(p_username)) then
  v_data:=jsonb_set(v_data,'{members}',(v_data->'members')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'name',p_username)));
  v_data:=jsonb_set(v_data,'{logs}',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'at',now(),'text',p_username||' 加入房间'))||(v_data->'logs'));
  update public.trip_rooms set data=v_data,version=version+1,updated_at=now() where id=v_old.id returning version into v_old.version;
 end if;
 return jsonb_build_object('room',v_data,'code',v_old.code,'version',v_old.version);
end $$;
revoke all on function public.trip_create(text,text,text), public.trip_list(text), public.trip_load(text), public.trip_save(text,text,bigint,jsonb), public.trip_join(text,text) from public;
grant execute on function public.trip_create(text,text,text), public.trip_list(text), public.trip_load(text), public.trip_save(text,text,bigint,jsonb), public.trip_join(text,text) to anon, authenticated;
