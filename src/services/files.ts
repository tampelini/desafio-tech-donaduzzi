import { Capacitor } from '@capacitor/core';

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  // No APK (WebView) downloads de blob não funcionam: o arquivo é gravado em
  // Documentos e oferecido pela folha de compartilhamento do Android.
  if (Capacitor.isNativePlatform()) {
    void saveNative(filename, content);
    return;
  }
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveNative(filename: string, content: string) {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  try {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: filename, files: [uri], dialogTitle: 'Salvar ou enviar arquivo' });
  } catch (err) {
    // Cancelar o compartilhamento não é erro; demais falhas ficam no console.
    if (!String(err).includes('cancel')) {
      console.error('Falha ao exportar arquivo', err);
      window.alert('Não foi possível exportar o arquivo neste aparelho.');
    }
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function timestampForFile(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export function newId(prefix = ''): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}-${rnd}`;
}
