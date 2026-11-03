import { useEffect, useState } from 'react';
import { Delete, Lock } from 'lucide-react';
import { verifyPin } from '../services/pin';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
let failures = 0;
let lockedUntil = 0;

export function AdminGate({ onUnlock, onCancel }: { onUnlock: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const locked = now < lockedUntil;

  useEffect(() => {
    if (!locked) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [locked]);

  async function submit(value = pin) {
    if (locked || !value) return;
    if (await verifyPin(value)) {
      failures = 0;
      onUnlock();
      return;
    }
    failures++;
    setPin('');
    if (failures >= MAX_ATTEMPTS) {
      failures = 0;
      lockedUntil = Date.now() + LOCKOUT_MS;
      setNow(Date.now());
      setError('Muitas tentativas. Aguarde 1 minuto.');
    } else setError('PIN incorreto.');
  }

  const press = (d: string) => {
    if (locked) return;
    setError('');
    setPin((p) => (p.length < 12 ? p + d : p));
  };

  return (
    <div className="admin-root flex min-h-full items-center justify-center bg-bg p-6 text-ink">
      <form
        className="glass w-full max-w-sm rounded-3xl p-6 text-center"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Lock className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mt-2 font-display text-2xl font-bold">Área administrativa</h1>
        <p className="mt-1 text-sm text-ink/70">Digite o PIN de acesso.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          aria-label="PIN"
          value={pin}
          disabled={locked}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
          className="mt-4 w-full text-center text-2xl tracking-[0.5em]"
        />
        <p className="mt-2 min-h-[1.5rem] text-sm text-danger" role="alert">
          {locked ? `Bloqueado por ${Math.ceil((lockedUntil - now) / 1000)} s.` : error}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)} className="min-h-[60px] rounded-xl bg-surface text-2xl font-bold active:bg-primary/30">
              {d}
            </button>
          ))}
          <button type="button" onClick={onCancel} className="min-h-[60px] rounded-xl text-sm font-semibold text-ink/70">
            Cancelar
          </button>
          <button type="button" onClick={() => press('0')} className="min-h-[60px] rounded-xl bg-surface text-2xl font-bold active:bg-primary/30">
            0
          </button>
          <button type="button" aria-label="Apagar" onClick={() => setPin((p) => p.slice(0, -1))} className="flex min-h-[60px] items-center justify-center rounded-xl">
            <Delete className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
        <button type="submit" disabled={locked || !pin} className="mt-4 min-h-[56px] w-full rounded-xl bg-primary text-lg font-bold text-bg disabled:opacity-40">
          Entrar
        </button>
      </form>
    </div>
  );
}
