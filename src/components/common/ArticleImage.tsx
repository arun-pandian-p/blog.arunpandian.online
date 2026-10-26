import React, { useState } from 'react';
import { BookOpen, FileText, Image as ImageIcon } from 'lucide-react';

interface ArticleImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  category?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  showCategoryBadge?: boolean;
}

export const ArticleImage: React.FC<ArticleImageProps> = ({
  src,
  alt = 'Article cover',
  className = '',
  containerClassName = '',
  category,
  aspectRatio = 'video',
  showCategoryBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize image source: verify valid HTTP/data/relative paths
  const isValidSrc = Boolean(
    src &&
    typeof src === 'string' &&
    src.trim().length > 0 &&
    !src.includes('undefined') &&
    !src.includes('null') &&
    (src.startsWith('http://') ||
     src.startsWith('https://') ||
     src.startsWith('data:') ||
     src.startsWith('/'))
  );

  const aspectClass = {
    video: 'aspect-[16/9]',
    wide: 'aspect-[2/1]',
    square: 'aspect-square',
    auto: 'h-full w-full'
  }[aspectRatio] || 'aspect-[16/9]';

  // Fallback placeholder rendering (warm neutral editorial design)
  if (!isValidSrc || hasError) {
    return (
      <div
        className={`w-full ${aspectClass} rounded-xl bg-gradient-to-br from-[#F5EFEB] via-[#EFE7DE] to-[#E5DCD0] border border-[#DDD4C7]/60 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden relative group ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        {/* Subtle decorative background lines */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#1C1A17_1px,transparent_1px)] [background-size:12px_12px]" />

        <div className="relative z-10 flex flex-col items-center gap-2 max-w-[85%]">
          <div className="w-10 h-10 rounded-xl bg-white/70 backdrop-blur-xs border border-[#DDD4C7] shadow-2xs flex items-center justify-center text-[#B83A26]">
            <BookOpen size={18} strokeWidth={2.2} />
          </div>

          {category && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E665C] px-2 py-0.5 rounded-full bg-white/60 border border-[#DDD4C7]">
              {category}
            </span>
          )}

          {alt && alt !== 'Article cover' && (
            <span className="text-[11px] font-serif font-semibold text-[#3E3A33] line-clamp-1 italic max-w-full opacity-80">
              {alt}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-[#F5EFEB] border border-[#DDD4C7]/50 ${containerClassName}`}>
      {/* Skeleton / Shimmer while image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFEB] via-[#EBE2D5] to-[#F5EFEB] animate-pulse flex items-center justify-center">
          <ImageIcon size={20} className="text-[#C4BAA9] opacity-40" />
        </div>
      )}

      <img
        src={src!}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${className}`}
      />

      {showCategoryBadge && category && isLoaded && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white shadow-xs">
            {category}
          </span>
        </div>
      )}
    </div>
  );
};

export default ArticleImage;
