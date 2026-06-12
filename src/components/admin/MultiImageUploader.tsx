import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface Slot {
  preview: string;
  path: string;
  busy: boolean;
  error: string | null;
}

interface Props {
  obraId: string;
  folder: string;
}

export default function MultiImageUploader({ obraId, folder }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [saving, setSaving] = useState(false);

  function updateSlot(i: number, update: Partial<Slot>) {
    setSlots(prev => prev.map((s, idx) => (idx === i ? { ...s, ...update } : s)));
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;

    const baseIdx = slots.length;
    const newSlots: Slot[] = files.map(f => ({
      preview: URL.createObjectURL(f),
      path: '',
      busy: true,
      error: null,
    }));
    setSlots(prev => [...prev, ...newSlots]);

    await Promise.all(
      files.map(async (file, i) => {
        const idx = baseIdx + i;
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
          setSlots(prev => prev.map((s, j) => (j === idx ? { ...s, path: data.path, busy: false } : s)));
        } catch (err) {
          setSlots(prev =>
            prev.map((s, j) => (j === idx ? { ...s, error: (err as Error).message, busy: false } : s))
          );
        }
      })
    );
  }

  function remove(i: number) {
    setSlots(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, j) => j !== i);
    });
  }

  async function handleSave() {
    const ready = slots.filter(s => s.path);
    if (!ready.length) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('_action', 'add');
      fd.set('obra_id', obraId);
      ready.forEach((s, i) => fd.set(`path_${i}`, s.path));
      await fetch('/api/admin/obra-fotos', { method: 'POST', body: fd });
      window.location.href = `/admin/obras/${obraId}?saved=1`;
    } catch {
      setSaving(false);
    }
  }

  const readyCount = slots.filter(s => s.path).length;
  const anyBusy = slots.some(s => s.busy);

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-6 cursor-pointer transition-colors bg-white">
        <span className="text-3xl">🖼️</span>
        <span className="text-sm font-semibold text-gray-700">Clique para escolher fotos</span>
        <span className="text-xs text-gray-400">Pode selecionar várias de uma vez</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onPick}
          disabled={saving}
        />
      </label>

      {slots.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {slots.map((slot, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img src={slot.preview} alt="" className="w-full h-full object-cover" />

                {slot.busy && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Enviando…</span>
                  </div>
                )}

                {slot.error && (
                  <div className="absolute inset-0 bg-red-500/85 flex items-center justify-center p-2">
                    <span className="text-white text-[10px] text-center leading-tight">{slot.error}</span>
                  </div>
                )}

                {slot.path && !slot.busy && (
                  <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                )}

                {!slot.busy && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
                    aria-label="Remover"
                  >×</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {anyBusy ? 'Enviando…' : `${readyCount} foto${readyCount !== 1 ? 's' : ''} pronta${readyCount !== 1 ? 's' : ''}`}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!readyCount || anyBusy || saving}
              className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-125 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Salvando…' : `Salvar ${readyCount} foto${readyCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
