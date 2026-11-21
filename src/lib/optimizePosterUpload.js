// Browser-side poster optimization. Preserves pixel dimensions and aspect ratio.
// Animated GIFs and unsupported environments are left unchanged.
const convertible = new Set(['image/jpeg', 'image/png', 'image/webp']);
export async function optimizePosterUpload(file, {quality=0.82}={}) {
  if (!file || !convertible.has(file.type) || typeof document==='undefined' ||
      typeof createImageBitmap!=='function') return file;
  let bitmap;
  try {
    bitmap=await createImageBitmap(file);
    if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height>24000000) return file;
    const canvas=document.createElement('canvas');
    canvas.width=bitmap.width;
    canvas.height=bitmap.height;
    const context=canvas.getContext('2d');
    if(!context) return file;
    context.drawImage(bitmap,0,0);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
    if(!blob || blob.type!=='image/webp' || blob.size>=file.size) return file;
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{
      type:'image/webp',lastModified:file.lastModified||Date.now()
    });
  } catch {
    // Upload the original rather than failing when browser conversion is unavailable.
    return file;
  } finally {
    bitmap?.close?.();
  }
}
