/*
 * Registro do Service Worker. Quando há nova versão, ela fica pendente e só é
 * ativada (com recarga) quando o totem está na tela inicial — nunca no meio
 * de uma partida.
 */

import { Capacitor } from '@capacitor/core';

type Listener = (available: boolean) => void;

let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let pending = false;
const listeners = new Set<Listener>();

export async function registerPWA() {
  // No APK os arquivos já são locais: o Service Worker não é necessário, e as
  // atualizações chegam instalando uma nova versão do APK.
  if (import.meta.env.DEV || !('serviceWorker' in navigator) || Capacitor.isNativePlatform()) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        pending = true;
        listeners.forEach((l) => l(true));
      },
      onRegisteredSW(_url, registration) {
        // Verifica atualizações a cada hora quando houver conexão.
        if (registration) setInterval(() => navigator.onLine && registration.update().catch(() => {}), 60 * 60 * 1000);
      },
    });
  } catch (err) {
    console.warn('Falha ao registrar Service Worker', err);
  }
}

export function onUpdateAvailable(listener: Listener): () => void {
  listeners.add(listener);
  listener(pending);
  return () => listeners.delete(listener);
}

export function applyUpdate() {
  if (pending && updateSW) void updateSW(true);
}
