import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, Loader2, CheckCircle } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

/**
 * FileUpload — reusable drag-and-drop / click-to-upload component
 * Props:
 *   value        — current URL string (for single) or array of {url, publicId} (for multiple)
 *   onChange     — called with (url, publicId) for single, or updated array for multiple
 *   folder       — Cloudinary folder name (e.g. 'furnihub/logos')
 *   multiple     — allow multiple files
 *   accept       — 'image/*', 'video/*', or 'image/*,video/*'
 *   label        — label text
 *   preview      — 'square' | 'banner' | 'round'
 *   maxFiles     — max number of files when multiple=true
 */
export default function FileUpload({
  value = null,
  onChange,
  folder = 'furnihub/general',
  multiple = false,
  accept = 'image/*',
  label = 'Upload File',
  preview = 'square',
  maxFiles = 5,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': undefined }, // Let axios auto-set multipart boundary
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    return res.data.data;
  };

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const remaining = maxFiles - current.length;
        const filesToUpload = Array.from(files).slice(0, remaining);

        const results = [];
        for (let i = 0; i < filesToUpload.length; i++) {
          setProgress(Math.round(((i) / filesToUpload.length) * 100));
          const data = await uploadFile(filesToUpload[i]);
          results.push({ url: data.url, publicId: data.publicId });
        }
        onChange([...current, ...results]);
        toast.success(`${results.length} file(s) uploaded`);
      } else {
        const data = await uploadFile(files[0]);
        onChange(data.url, data.publicId);
        toast.success('Uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [value, multiple, maxFiles, folder, onChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveSingle = () => onChange(null, null);

  const handleRemoveMultiple = (idx) => {
    const updated = [...(value || [])];
    updated.splice(idx, 1);
    onChange(updated);
  };

  const previewClass = {
    square: 'w-32 h-32 rounded-xl',
    banner: 'w-full h-28 rounded-xl',
    round: 'w-24 h-24 rounded-full',
  }[preview];

  return (
    <div className="w-full">
      {label && <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">{label}</p>}

      {/* Single preview */}
      {!multiple && value && (
        <div className="relative mb-3 inline-block">
          <div className={`${previewClass} overflow-hidden border-2 border-[var(--border)] bg-[var(--surface-2)]`}>
            {value.includes('video') ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="preview" className="w-full h-full object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={handleRemoveSingle}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
          <div className="mt-2 flex items-center text-green-600 text-xs font-bold gap-1">
            <CheckCircle size={13} /> Uploaded
          </div>
        </div>
      )}

      {/* Multiple previews */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((item, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
              {typeof item === 'string' ? (
                <img src={item} alt="" className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemoveMultiple(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {(!multiple || !value || value.length < maxFiles) && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all p-6 ${
            isDragging
              ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]'
              : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)]'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
              <p className="text-sm font-bold text-[var(--primary)]">Uploading... {progress}%</p>
              <div className="w-full bg-[var(--border)] rounded-full h-1.5 mt-1">
                <div className="bg-[var(--accent)] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              {accept.includes('video') ? <Video size={28} className="text-[var(--text-secondary)]" /> : <Image size={28} className="text-[var(--text-secondary)]" />}
              <p className="text-sm font-bold text-[var(--primary)]">
                {isDragging ? 'Drop to upload' : 'Click or drag & drop'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {accept.replace('/*', '').replace(',', ' or ')} • Max 50MB
                {multiple && value?.length > 0 ? ` • ${maxFiles - value.length} remaining` : ''}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
