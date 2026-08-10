import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  initialImage?: string;
  onImageSelected: (file: File | null) => void;
  className?: string;
}

export default function ImageUpload({ initialImage, onImageSelected, className = '' }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialImage if it changes from outside
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Only PNG, WebP, AVIF, and SVG are allowed.');
      return;
    }

    if (file.size > 500 * 1024) {
      alert('File is too large. Limit is 500KB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelected(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-16 h-16 border border-border-ink bg-surface flex-shrink-0 group">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <button
              onClick={handleClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 border border-border-ink border-dashed flex items-center justify-center bg-surface flex-shrink-0">
            <span className="text-border-ink text-xs">No img</span>
          </div>
        )}
        
        <div className="flex-1">
          <input 
            type="file" 
            accept="image/png, image/webp, image/avif, image/svg+xml"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full border border-border-ink hover:border-accent-gold bg-background p-2 text-sm font-mono text-text-secondary hover:text-accent-gold transition-colors"
          >
            <Upload className="w-4 h-4" />
            {previewUrl ? 'Change Image' : 'Select Image'}
          </button>
        </div>
      </div>
      <p className="text-[10px] font-mono text-text-secondary">
        Max size: 500KB. Formats: PNG, WebP, AVIF, SVG.
      </p>
    </div>
  );
}
