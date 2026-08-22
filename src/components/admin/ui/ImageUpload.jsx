import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  Upload, X, Loader2, Link as LinkIcon, FileVideo,
  FileText, FileSpreadsheet, Presentation, File as FileIcon,
  FileArchive, ExternalLink, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getFileKind, getKindLabel, getFileName } from '../../../utils/fileType';

// Pick the Lucide icon that matches a file kind.
const KIND_ICON = {
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slides: Presentation,
  text: FileText,
  archive: FileArchive,
  video: FileVideo,
  other: FileIcon,
};

export default function ImageUpload({ url, onUpload, folder = 'uploads', label = 'Image', accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState(url || '');
  const fileInputRef = useRef(null);

  // Only restrict to images when the caller hasn't opted into broader types.
  const imageOnly = accept === 'image/*';
  const acceptsAny = accept === '*' || accept === '*/*' || accept.includes('*/*');
  const acceptsVideo = accept.includes('video');

  const kind = getFileKind(url);
  const isImageFile = kind === 'image';
  const isVideoFile = kind === 'video' || (acceptsVideo && !url); // fall back to widget intent

  const handleFileProcess = async (file) => {
    if (!file) return;

    // Supabase has strict file size limits, so we check on the client first
    const maxMb = imageOnly ? 5 : 50;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File is too large (max ${maxMb}MB).`);
      return;
    }

    const isImageFileCheck = file.type.startsWith('image/');
    const isVideoFileCheck = file.type.startsWith('video/') || getFileKind(file.name) === 'video';

    if (imageOnly && !isImageFileCheck) {
      toast.error('Only image files are allowed here.');
      return;
    }
    if (acceptsVideo && !acceptsAny && !isVideoFileCheck && !isImageFileCheck) {
      toast.error('Only image or video files are allowed here.');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { contentType: file.type || undefined });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      onUpload(data.publicUrl);
      setManualUrl(data.publicUrl);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading file: ' + error.message);
      console.error(error);
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleFileChange = (event) => {
    handleFileProcess(event.target.files[0]);
    event.target.value = ''; // allow re-selecting the same file
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onUpload(manualUrl.trim());
      toast.success('File URL set!');
    }
  };

  const clear = () => {
    onUpload('');
    setManualUrl('');
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const acceptHint = imageOnly
    ? 'PNG, JPG, WEBP (max 5MB)'
    : acceptsVideo && !acceptsAny
      ? 'MP4, WEBM, PNG, JPG (max 50MB)'
      : 'PDF, DOC, PPT, XLS, images — any file (max 50MB)';

  const KindIcon = KIND_ICON[kind] || FileIcon;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-700">{label}</label>

      {/* Hidden input shared by the dropzone and the Replace button */}
      <input
        type="file"
        className="hidden"
        accept={accept === '*' ? undefined : accept}
        onChange={handleFileChange}
        disabled={uploading}
        ref={fileInputRef}
      />

      {url ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
          {isImageFile ? (
            <img loading="lazy" src={url} alt={label} className="w-full h-40 object-cover" />
          ) : isVideoFile ? (
            <video src={url} autoPlay muted loop playsInline className="w-full h-40 object-cover" />
          ) : (
            // Non-visual files (PDF, DOC, XLS, PPT, ...) get a labelled file card
            // instead of a broken <img alt="" loading="lazy">.
            <div className="flex h-40 w-full items-center gap-4 px-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <KindIcon size={30} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{getKindLabel(url)}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-700" title={getFileName(url)}>
                  {getFileName(url)}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  <ExternalLink size={13} /> Open file
                </a>
              </div>
            </div>
          )}

          {/* Action overlay — Replace + Remove, always reachable (not hover-only on mobile) */}
          <div className="absolute inset-x-0 top-0 flex justify-end gap-2 p-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-50"
              title="Replace file"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Replace
            </button>
            <button
              type="button"
              onClick={clear}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-red-500 shadow-sm hover:bg-red-50"
              title="Remove file"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
              ) : acceptsVideo && !acceptsAny ? (
                <FileVideo className={`w-8 h-8 mb-2 ${isDragging ? 'text-teal-500' : 'text-slate-400'}`} />
              ) : (
                <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-teal-500' : 'text-slate-400'}`} />
              )}
              <p className="mb-2 text-sm text-slate-500 font-medium text-center px-4">
                {uploading ? 'Uploading...' : isDragging ? 'Drop file here' : 'Click or drag to upload'}
              </p>
              <p className="text-[10px] text-slate-400 text-center px-2">{acceptHint}</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept === '*' ? undefined : accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          <div className="relative flex items-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center w-full">
              <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase">Or provide URL</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon size={16} />
              </div>
              <input
                type="url"
                placeholder="https://..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit(e);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!manualUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
