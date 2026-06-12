import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface SlotState {
  path: string;
  busy: boolean;
  error: string | null;
}

interface Props {
  count: number;
  folder: string;
  storagePublicUrl: string;
}

function resolve(path: string, base: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return base + path;
}

export default function MultiImageUploader({ count, folder, storagePublicUrl }: Props) {
  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: count }, () => ({ path: '', busy: false, error: null }))
  );

  function updateSlot(i: number, update: Partial<SlotState>) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...update } : s));
  }

  async function onPick(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateSlot(i, { busy: true, error: null });
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/webp',
      });
      const fd = new FormData();
      fd.set('file', compressed, compressed.name.replace(/\.\w+$/, '.webp'));
      fd.set('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'falha no upload');
      updateSlot(i, { path: data.path, busy: false });
    } catch (err) {
      updateSlot(i, { error: (err as Error).message, busy: false });
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {slots.map((slot, i) => {
        const previewUrl = resolve(slot.path, storagePublicUrl);
        return (
          <div key={i} className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Foto {i + 1}</p>
            <input type="hidden" name={`path_${i}`} value={slot.path} />

            {previewUrl ? (
              <div className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => updateSlot(i, { path: '' })}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none"
                  aria-label="Remover"
                >×</button>
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-3xl">+</div>
            )}

            <label className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer transition-colors w-full">
              {slot.busy ? 'Enviando…' : previewUrl ? 'Trocar' : 'Escolher'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPick(i, e)}
                disabled={slot.busy}
              />
            </label>

            <input
              name={`alt_${i}`}
              type="text"
              placeholder="Descrição (opcional)"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-orange"
            />

            {slot.error && <p className="text-xs text-red-600">{slot.error}</p>}
          </div>
        );
      })}
    </div>
  );
}
