import { useRef, useState } from 'react';
import { Camera, Loader2, X, ImageOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface ImageUploadProps {
  bucket: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  shape?: 'square' | 'circle';
  label?: string;
}

const MAX_SIZE_MB = 5;

export function ImageUpload({ bucket, folder, value, onChange, shape = 'square', label }: ImageUploadProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Escolha um arquivo de imagem (JPG, PNG, etc).', 'error');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`A imagem deve ter até ${MAX_SIZE_MB}MB.`, 'error');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      showToast('Não foi possível enviar a imagem. Tente novamente.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const shapeClass = shape === 'circle' ? 'w-24 h-24 rounded-full' : 'w-full h-32 rounded-xl';

  return (
    <div>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className={`${label ? 'mt-1' : ''} relative ${shapeClass} overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto sm:mx-0`}>
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="w-7 h-7 text-gray-300" />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-1 right-1 bg-white shadow rounded-full p-1.5 hover:bg-gray-50 transition-colors"
          title="Escolher imagem do aparelho"
        >
          <Camera className="w-4 h-4 text-gray-700" />
        </button>

        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-white shadow rounded-full p-1 hover:bg-gray-50 transition-colors"
            title="Remover imagem"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
