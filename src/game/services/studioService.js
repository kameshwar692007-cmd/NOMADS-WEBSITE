import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { STUDIO_PROJECTS } from '../data/campusContent.js';

const LOCAL_KEY = 'nomads-studio-projects-dev-v1';
const allowedTypes = new Set(['image/jpeg','image/png','image/webp','image/gif']);
const validUrl = value => !value || value.startsWith('/') || /^https:\/\//i.test(value);
const map = row => ({
  id:row.id, title:row.title, genre:row.genre, engine:row.engine,
  status:row.status, accent:row.accent, image:row.image_url,
  desc:row.description, projectUrl:row.project_url || '',
  isPublished:row.is_published, displayOrder:row.display_order
});
const localRead = () => {
  try {
    const stored = window.localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : STUDIO_PROJECTS.map((item,index) => ({
      ...item, isPublished:true, projectUrl:'', displayOrder:(index+1)*10
    }));
  } catch { return STUDIO_PROJECTS.map((item,index) => ({
    ...item, isPublished:true, projectUrl:'', displayOrder:(index+1)*10
  })); }
};
const localWrite = records => window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
const ensureStaff = async (deleting=false) => {
  if (!isSupabaseConfigured || !supabase) return;
  const { data: { user }, error:authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Sign in with a verified Supabase staff account.');
  const { data, error } = await supabase.from('admin_users').select('role').eq('id',user.id).single();
  if (error || !['SUPER_ADMIN','ADMIN','EDITOR'].includes(data?.role))
    throw new Error('Only verified staff can manage studio projects.');
  if (deleting && data.role === 'EDITOR')
    throw new Error('Only Admins or Super Admins can remove studio projects.');
};
const validate = input => {
  const title=String(input.title||'').trim();
  if (!title || title.length > 140) throw new Error('Title must be 1–140 characters.');
  const accent=String(input.accent||'#38bdf8').trim();
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw new Error('Invalid color. Use #RRGGBB.');
  const image=String(input.image||'').trim();
  const projectUrl=String(input.projectUrl||'').trim();
  if (!validUrl(image) || !validUrl(projectUrl)) throw new Error('Only HTTPS or internal URLs are allowed.');
  return {
    title,genre:String(input.genre||'').trim(),engine:String(input.engine||'').trim(),
    status:String(input.status||'IN DEVELOPMENT').trim(),accent,
    image_url:image,description:String(input.desc||'').trim(),
    project_url:projectUrl || null,is_published:Boolean(input.isPublished),
    display_order:Number.isFinite(Number(input.displayOrder))?Math.trunc(Number(input.displayOrder)):0
  };
};
export const studioService = {
  isCloudConnected: () => Boolean(isSupabaseConfigured && supabase),
  async getProjects({ includeDrafts=false }={}) {
    if (isSupabaseConfigured && supabase) {
      if(includeDrafts) await ensureStaff();
      let query=supabase.from('studio_projects').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:true});
      if(!includeDrafts) query=query.eq('is_published',true);
      const {data,error}=await query;
      if(error) throw new Error('Studio projects could not load: '+error.message);
      return (data||[]).map(map);
    }
    return localRead().filter(item => includeDrafts || item.isPublished)
      .sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
  },
  async saveProject(input) {
    const values=validate(input);
    await ensureStaff();
    if (isSupabaseConfigured && supabase) {
      const existing = input.id ? {id:input.id} : {};
      const query = input.id
        ? supabase.from('studio_projects').update(values).eq('id',input.id)
        : supabase.from('studio_projects').insert({...values,id:crypto.randomUUID()});
      const {data,error}=await query.select('*').single();
      if(error) throw new Error('Studio save failed: '+error.message);
      return map(data);
    }
    const records=localRead();
    const id=input.id || 'studio-'+Date.now();
    const saved={...input,...{
      title:values.title,genre:values.genre,engine:values.engine,status:values.status,
      accent:values.accent,image:values.image_url,desc:values.description,
      projectUrl:values.project_url||'',isPublished:values.is_published,
      displayOrder:values.display_order
    },id};
    const idx=records.findIndex(item=>item.id===id);
    if(idx===-1) records.push(saved);else records[idx]=saved;
    localWrite(records);
    return saved;
  },
  async removeProject(id) {
    await ensureStaff(true);
    if (isSupabaseConfigured && supabase) {
      const {data,error}=await supabase.from('studio_projects').delete().eq('id',id).select('id').single();
      if(error || !data) throw new Error('Studio deletion failed: '+(error?.message||'Project not found.'));
      return;
    }
    const records=localRead();
    if(!records.some(item=>item.id===id)) throw new Error('Project not found.');
    localWrite(records.filter(item=>item.id!==id));
  },
  async uploadPoster(file) {
    if(!file || !allowedTypes.has(file.type) || file.size > 5*1024*1024 || file.size===0)
      throw new Error('Choose a JPEG, PNG, WebP or GIF poster under 5 MB.');
    await ensureStaff();
    if (!isSupabaseConfigured || !supabase)
      throw new Error('Poster upload needs Supabase. Local demo mode cannot upload media.');
    const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[file.type];
    const path='projects/'+crypto.randomUUID()+'.'+extension;
    const {error}=await supabase.storage.from('studio-posters').upload(path,file,{
      contentType:file.type,upsert:false,cacheControl:'3600'
    });
    if(error) throw new Error('Studio poster upload failed: '+error.message);
    const {data}=supabase.storage.from('studio-posters').getPublicUrl(path);
    return data.publicUrl;
  }
};
