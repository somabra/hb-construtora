import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface Props {
  /** Nome do input hidden que vai receber o path final. */
  name: string;
  /** Path/URL inicial (caso edição). */
  initial?: string | null;
  /** Pasta destino no Storage (ex: "servicos", "obras"). */
  folder: string;
  /** URL pra resolver path em URL (passa o STORAGE_URL público). */
  storagePublicUrl: string;
}

function resolve(path: string | null, base: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return base + path;
}

export default function ImageUploader({ name, initial, folder, storagePublicUrl }: Props) {
  const [path, setPath] = useState<string>(initial ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
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
      setPath(data.path);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  const previewUrl = resolve(path, storagePublicUrl);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={path} />

      {previewUrl && (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-w-md aspect-video object-cover rounded-lg border border-gray-200 bg-gray-50"
          />
          <button
            type="button"
            onClick={() => setPath('')}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remover imagem"
          >
            ×
          </button>
        </div>
      )}

      <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer transition-colors">
        {busy ? 'Comprimindo e enviando...' : (previewUrl ? 'Trocar imagem' : 'Escolher imagem')}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
          disabled={busy}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-[11px] text-gray-400">JPG/PNG/WebP até 5MB. Comprimimos pra ~400KB automaticamente.</p>
    </div>
  );
}
