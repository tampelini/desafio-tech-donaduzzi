import { useState } from 'react';
import { BarChart3, GraduationCap, KeyRound, ListChecks, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useIdle } from '../hooks/useIdle';
import { AdminGate } from './AdminGate';
import { QuestionsTab } from './QuestionsTab';
import { CoursesTab } from './CoursesTab';
import { SettingsTab } from './SettingsTab';
import { StatsTab } from './StatsTab';
import { SecurityTab } from './SecurityTab';

const TABS = [
  { id: 'questions', label: 'Perguntas', Icon: ListChecks },
  { id: 'courses', label: 'Cursos', Icon: GraduationCap },
  { id: 'settings', label: 'Configurações', Icon: SettingsIcon },
  { id: 'stats', label: 'Estatísticas', Icon: BarChart3 },
  { id: 'security', label: 'Segurança', Icon: KeyRound },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function exitAdmin() {
  window.location.hash = '';
}

export default function AdminApp() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>('questions');

  // Sessão administrativa expira após 5 minutos sem uso: o totem nunca fica
  // com o painel aberto para visitantes.
  useIdle(5 * 60 * 1000, exitAdmin, true);

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} onCancel={exitAdmin} />;

  return (
    <div className="admin-root bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-primary/20 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="mr-auto font-display text-xl font-bold">Painel administrativo — Desafio Tech</h1>
          <button type="button" onClick={exitAdmin} className="flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-bg">
            <LogOut className="h-5 w-5" aria-hidden="true" /> Sair e voltar ao jogo
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2" aria-label="Seções">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex min-h-[48px] items-center gap-2 whitespace-nowrap border-b-2 px-4 font-semibold ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-ink/70'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'courses' && <CoursesTab />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'security' && <SecurityTab />}
      </main>
    </div>
  );
}
