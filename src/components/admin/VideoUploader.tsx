import { useState } from 'react';

interface Props {
  name: string;
  initial?: string | null;
  folder: string;
  storagePublicUrl: string;
}

function resolve(path: string | null, base: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return base + path;
}

export default function VideoUploader({ name, initial, folder, storagePublicUrl }: Props) {
  const [path, setPath] = useState<string>(initial ?? '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      setError('Vídeo maior que 60MB. Comprima ele antes de subir.');
      e.target.value = '';
      return;
    }

    setBusy(true);
    setError(null);
    setProgress(0);

    const fd = new FormData();
    fd.set('file', file);
    fd.set('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setBusy(false);
      e.target.value = '';
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setPath(data.path);
        } else {
          setError(data.error || `Erro ${xhr.status}`);
        }
      } catch {
        setError('Resposta inválida do servidor');
      }
    };
    xhr.onerror = () => {
      setBusy(false);
      setError('Falha de rede');
    };
    xhr.send(fd);
  }

  const url = resolve(path, storagePublicUrl);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={path} />

      {url && (
        <div className="relative group inline-block">
          <video
            src={url}
            controls
            className="w-full max-w-[240px] aspect-[9/16] object-cover rounded-lg border border-gray-200 bg-black"
          />
          <button
            type="button"
            onClick={() => setPath('')}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
            aria-label="Remover vídeo"
          >
            ×
          </button>
        </div>
      )}

      <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer transition-colors">
        {busy ? `Enviando... ${progress}%` : (url ? 'Trocar vídeo' : 'Escolher vídeo')}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={onPick}
          disabled={busy}
        />
      </label>

      {busy && (
        <div className="w-full max-w-[240px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-orange transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-[11px] text-gray-400">MP4/WebM/MOV até 60MB. Vertical (9:16) recomendado.</p>
    </div>
  );
}
