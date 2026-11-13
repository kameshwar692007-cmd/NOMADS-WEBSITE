import {useEffect,useState} from 'react';
import {studioService} from '../game/services/studioService.js';
import './StudioAdmin.css';

const blank = {title:'',genre:'',engine:'',status:'IN DEVELOPMENT',accent:'#38bdf8',image:'',
  desc:'',projectUrl:'',displayOrder:50,isPublished:false};
export default function StudioAdmin({role}) {
  const [projects,setProjects]=useState([]);
  const [draft,setDraft]=useState(null);
  const [busy,setBusy]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const canDelete=role?.isAdmin || role?.isSuperAdmin;
  const reload=async()=>{
    try {setProjects(await studioService.getProjects({includeDrafts:true}));}
    catch(err){setError(err.message);}
  };
  useEffect(()=>{reload();},[]);
  const set=(key,value)=>setDraft(current=>({...current,[key]:value}));
  const save=async(event)=>{
    event.preventDefault();
    if(busy || uploading)return;
    setBusy(true);setError('');setNotice('');
    try {
      await studioService.saveProject(draft);
      await reload();setDraft(null);setNotice('Studio project saved.');
    } catch(err){setError(err.message);} finally{setBusy(false);}
  };
  const upload=async(event)=>{
    const file=event.target.files?.[0];if(!file)return;
    setError('');setUploading(true);
    try {set('image',await studioService.uploadPoster(file));}
    catch(err){setError(err.message);}
    finally{setUploading(false);event.target.value='';}
  };
  const remove=async(project)=>{
    if(!canDelete)return;
    if(!window.confirm('Permanently remove "'+project.title+'"?'))return;
    setError('');setBusy(true);
    try {await studioService.removeProject(project.id);await reload();setNotice('Studio project removed.');}
    catch(err){setError(err.message);}finally{setBusy(false);}
  };
  return <section className="studio-admin gamified-card" aria-label="Manage Studio games and projects">
    <div className="studio-admin-heading">
      <div><span className="studio-admin-eyebrow">GAME DEVELOPMENT STUDIO</span>
      <h2>Studio projects</h2><p>Add, edit, publish, unpublish or remove studio games and projects.</p></div>
      <button type="button" className="studio-admin-primary" onClick={()=>{setError('');setDraft({...blank});}} disabled={busy}>Add studio game</button>
    </div>
    {!studioService.isCloudConnected() && <p className="studio-admin-warning">Offline demo mode: edits stay in this browser. Connect Supabase to publish.</p>}
    {error && <p role="alert" className="studio-admin-error">{error}</p>}
    {notice && <p role="status" className="studio-admin-notice">{notice}</p>}
    <div className="studio-admin-rows">
      {projects.map(project=><article className="studio-admin-row" key={project.id}>
        {project.image?<img className="studio-admin-thumb" alt="" src={project.image}/>:<div className="studio-admin-thumb studio-admin-no-image">No poster</div>}
        <div className="studio-admin-row-content"><strong>{project.title}</strong>
          <span>{project.genre||'Game development'} · {project.isPublished?'Published':'Draft'}</span></div>
        <div className="studio-admin-actions">
          <button type="button" onClick={()=>{setError('');setDraft({...project});}} disabled={busy}>Edit</button>
          {canDelete && <button type="button" className="studio-admin-danger" disabled={busy} onClick={()=>remove(project)}>Remove</button>}
        </div>
      </article>)}
      {!projects.length && <p>No studio projects available. Add your first project.</p>}
    </div>
    {draft && <form className="studio-admin-editor" onSubmit={save}>
      <h3>{draft.id?'Edit Studio game':'New Studio game'}</h3>
      <div className="studio-admin-fields">
        <label>Game / project title *<input required maxLength={140} value={draft.title} onChange={e=>set('title',e.target.value)}/></label>
        <label>Genre<input value={draft.genre} onChange={e=>set('genre',e.target.value)}/></label>
        <label>Engine / tools<input value={draft.engine} onChange={e=>set('engine',e.target.value)}/></label>
        <label>Status<input value={draft.status} onChange={e=>set('status',e.target.value)} placeholder="IN DEVELOPMENT"/></label>
        <label>Display order<input type="number" value={draft.displayOrder} onChange={e=>set('displayOrder',e.target.value)}/></label>
        <label>Accent color<input type="color" value={draft.accent} onChange={e=>set('accent',e.target.value)}/></label>
        <label className="studio-admin-wide">Description<textarea rows={3} value={draft.desc} onChange={e=>set('desc',e.target.value)}/></label>
        <label className="studio-admin-wide">Project link (optional)<input type="url" value={draft.projectUrl} onChange={e=>set('projectUrl',e.target.value)}/></label>
        <label className="studio-admin-wide">Poster URL<input value={draft.image} onChange={e=>set('image',e.target.value)} placeholder="Paste an HTTPS URL or upload below"/></label>
        <label className="studio-admin-wide">Upload original-size poster (JPEG, PNG, WebP or GIF; up to 5 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading||busy}/>
        </label>
        {uploading && <p role="status">Uploading poster…</p>}
        {draft.image && <div className="studio-admin-wide studio-admin-preview">
          <img src={draft.image} alt="Studio poster preview at original aspect ratio"/>
          <button type="button" onClick={()=>set('image','')}>Remove poster</button>
        </div>}
        <label className="studio-admin-wide studio-admin-publish">
          <input type="checkbox" checked={Boolean(draft.isPublished)} onChange={e=>set('isPublished',e.target.checked)}/>
          Publish on the public Studio page
        </label>
      </div>
      <div className="studio-admin-form-actions">
        <button className="studio-admin-primary" type="submit" disabled={busy||uploading}>{busy?'Saving…':'Save project'}</button>
        <button type="button" onClick={()=>setDraft(null)} disabled={busy||uploading}>Cancel</button>
      </div>
    </form>}
  </section>;
}
