-- READ-ONLY Supabase diagnostics for poster upload and event publishing.
-- Run in Supabase Dashboard > SQL Editor, NOT in your browser console.
-- Do not disable RLS or make storage uploads public to "fix" access.
-- Staff authentication is verified at request time using auth.uid().
select 'events table' as check_name, to_regclass('public.events')::text as result
union all
select 'staff table', to_regclass('public.admin_users')::text;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
  and column_name in ('listing_type','game_title','match_format','prize_pool','partner_info','title','status_mode')
order by column_name;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'event-posters';

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where (schemaname = 'storage' and tablename = 'objects')
   or (schemaname = 'public' and tablename in ('events','admin_users'))
order by schemaname, tablename, policyname;

-- Replace the email with the exact email used in the site's sign-in form.
-- Zero rows means the email is not an Auth user; NULL staff_role means the
-- Auth account exists but has not been assigned an authorized staff role.
select au.email, au.id as auth_user_id, au.email_confirmed_at,
       adm.role as staff_role
from auth.users au
left join public.admin_users adm on adm.id = au.id
where au.email = 'REPLACE_WITH_STAFF_EMAIL';

-- Important: SQL Editor usually runs with elevated database privileges.
-- A successful SQL Editor INSERT does not test browser RLS permissions.
-- Sign into /admin with a real Supabase Auth account whose exact UUID
-- matches a public.admin_users record, then retry uploading/publishing.
