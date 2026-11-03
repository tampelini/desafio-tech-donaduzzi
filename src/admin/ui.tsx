import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Tone = 'primary' | 'neutral' | 'danger';
const TONES: Record<Tone, string> = {
  primary: 'bg-primary text-bg',
  neutral: 'bg-surface text-ink border border-primary/25',
  danger: 'bg-danger text-white',
};

export function Btn({ tone = 'neutral', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 font-semibold disabled:opacity-40 ${TONES[tone]} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-ink/85">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink/60">{hint}</span>}
    </label>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {title && <h2 className="mr-auto font-display text-lg font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'error' | 'ok'; children: ReactNode }) {
  const styles = {
    info: 'border-primary/40 bg-primary/10',
    warn: 'border-gold/50 bg-gold/10',
    error: 'border-danger/50 bg-danger/10',
    ok: 'border-success/50 bg-success/10',
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
