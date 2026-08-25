import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  Upload, X, Loader2, Link as LinkIcon, FileVideo,
  FileText, FileSpreadsheet, Presentation, File as FileIcon,
  FileArchive, ExternalLink, RefreshCw, Maximize2, Minimize2,
  Image as ImageIcon
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
  const [fitMode, setFitMode] = useState('contain'); // 'contain' for 100% full visibility, 'cover' for filled
  const fileInputRef = useRef(null);

  // Only restrict to images when the caller hasn't opted into broader types.
  const imageOnly = accept === 'image/*';
  const acceptsAny = accept === '*' || accept === '*/*' || accept.includes('*/*');
  const acceptsVideo = accept.includes('video');

  const kind = getFileKind(url);
  const isImageFile = kind === 'image';
  const isVideoFile = kind === 'video' || (acceptsVideo && !url);

  const handleFileProcess = async (file) => {
    if (!file) return;

    const maxMb = imageOnly ? 10 : 50;
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
      toast.success('File uploaded successfully!', { icon: '📸' });
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
    event.target.value = '';
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
    ? 'PNG, JPG, WEBP, GIF (max 10MB)'
    : acceptsVideo && !acceptsAny
      ? 'MP4, WEBM, PNG, JPG (max 50MB)'
      : 'PDF, DOC, PPT, XLS, images — any file (max 50MB)';

  const KindIcon = KIND_ICON[kind] || FileIcon;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {label}
        </label>
        {url && isImageFile && (
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Asset
          </span>
        )}
      </div>

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
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2E2E44] bg-slate-900/5 dark:bg-[#12121E] shadow-sm transition-all">
          
          {/* Main Visual Display - Adaptive Height with Full View */}
          <div className="flex items-center justify-center min-h-[220px] max-h-[460px] p-3 overflow-hidden bg-slate-100/60 dark:bg-[#171726]">
            {isImageFile ? (
              <img
                loading="lazy"
                src={url}
                alt={label}
                className={`w-full max-h-[440px] rounded-xl transition-all duration-200 ${
                  fitMode === 'contain' ? 'object-contain h-auto' : 'object-cover h-[340px]'
                }`}
              />
            ) : isVideoFile ? (
              <video
                src={url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full max-h-[440px] object-contain rounded-xl"
              />
            ) : (
              // Non-visual files (PDF, DOC, XLS, PPT, ...)
              <div className="flex h-36 w-full items-center gap-4 px-5 bg-white dark:bg-[#1E1E2C] rounded-xl border border-slate-200 dark:border-[#2C2C40]">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#F29F67]/15 text-[#F29F67] border border-[#F29F67]/30">
                  <KindIcon size={30} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F29F67]">{getKindLabel(url)}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-white" title={getFileName(url)}>
                    {getFileName(url)}
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#F29F67] hover:underline"
                  >
                    <ExternalLink size={13} /> Open full file ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar Header (Always Visible & Accessible) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-[#1E1E2C]/95 backdrop-blur-md border-t border-slate-100 dark:border-[#2A2A3E] text-xs">
            <div className="flex items-center gap-2 truncate max-w-[50%]">
              <span className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400" title={url}>
                {getFileName(url) || url}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Fit Mode Toggle */}
              {isImageFile && (
                <button
                  type="button"
                  onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#33334B] text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252538] transition-colors cursor-pointer"
                  title={fitMode === 'contain' ? 'Switch to Filled View' : 'Switch to Full Uncropped View'}
                >
                  {fitMode === 'contain' ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                  <span>{fitMode === 'contain' ? 'Full View' : 'Fill'}</span>
                </button>
              )}

              {/* View Full Size ↗ */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#33334B] text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252538] transition-colors"
                title="Open original file in new tab"
              >
                <ExternalLink size={12} />
                <span className="hidden sm:inline">Open</span>
              </a>

              {/* Replace Button */}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F29F67] hover:bg-[#E8824A] text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                title="Replace with new file"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>Replace</span>
              </button>

              {/* Remove Button */}
              <button
                type="button"
                onClick={clear}
                className="p-1 rounded-lg border border-rose-200/40 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove asset"
                aria-label="Remove asset"
              >
                <X size={14} />
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-3">
          <label
            className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isDragging
                ? 'border-[#F29F67] bg-[#F29F67]/10'
                : 'border-slate-300 dark:border-[#2C2C40] bg-slate-50 dark:bg-[#181826] hover:bg-slate-100 dark:hover:bg-[#1E1E2C] hover:border-[#F29F67]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center p-5 pointer-events-none text-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#F29F67] animate-spin mb-2" />
              ) : acceptsVideo && !acceptsAny ? (
                <FileVideo className={`w-8 h-8 mb-2 ${isDragging ? 'text-[#F29F67]' : 'text-slate-400'}`} />
              ) : (
                <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-[#F29F67]' : 'text-slate-400'}`} />
              )}
              <p className="mb-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                {uploading ? 'Uploading to Supabase...' : isDragging ? 'Drop file here' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-[10px] font-mono text-slate-400">{acceptHint}</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept === '*' ? undefined : accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon size={14} />
              </div>
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit(e);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#2C2C40] bg-white dark:bg-[#1E1E2C] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-[#F29F67] outline-none transition-shadow"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!manualUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#1E1E2C] dark:bg-[#28283C] text-white text-xs font-bold hover:bg-[#F29F67] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Set URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
