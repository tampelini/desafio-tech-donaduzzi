import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import type { CategoryId, ResultTier, Settings, SurveyItem, ThemeColors } from '../types';
import { useAppData } from '../store/AppDataContext';
import { CATEGORIES } from '../data/categories';
import { DEFAULT_COLORS, DEFAULT_SETTINGS } from '../data/defaultSettings';
import { readFileAsDataUrl } from '../services/files';
import { QrCode } from '../components/QrCode';
import { Btn, Card, Field, Notice } from './ui';

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  brand: 'Institucional (vinho)',
  cream: 'Creme (banners)',
  bg: 'Fundo das telas claras',
  surface: 'Cartões',
  primary: 'Primária (carmim)',
  accent: 'Destaque (rosa)',
  success: 'Acerto (verde)',
  danger: 'Erro (vermelho)',
  gold: 'Pontuação (dourado)',
  ink: 'Texto',
};

export function validateSettings(s: Settings): string[] {
  const errors: string[] = [];
  const sum = Object.values(s.distribution).reduce((a, b) => a + (b || 0), 0);
  if (!s.gameName.trim()) errors.push('Informe o nome do jogo.');
  if (s.questionsPerGame < 1 || s.questionsPerGame > 50) errors.push('Perguntas por partida: entre 1 e 50.');
  if (sum > s.questionsPerGame) errors.push(`A distribuição por categoria soma ${sum}, mais que as ${s.questionsPerGame} perguntas por partida.`);
  if (s.timePerQuestion < 0 || s.timePerQuestion > 300) errors.push('Tempo por pergunta: entre 0 (desativado) e 300 s.');
  if (s.idleSeconds < 15) errors.push('Inatividade durante a partida: mínimo de 15 s.');
  if (s.coursesIdleSeconds < 5) errors.push('Inatividade na tela de cursos: mínimo de 5 s.');
  if (s.qrUrl && !/^https?:\/\/\S+\.\S+/.test(s.qrUrl)) errors.push('A URL do QR Code deve começar com http:// ou https://.');
  if (s.logoLinkUrl && !/^https?:\/\/\S+\.\S+/.test(s.logoLinkUrl)) errors.push('O link do logotipo deve começar com http:// ou https://.');
  if (s.survey.enabled && s.survey.items.some((it) => !it.prompt.trim())) errors.push('Preencha o texto das perguntas da pesquisa.');
  if (!s.resultTiers.some((t) => t.minPercent === 0)) errors.push('As mensagens de resultado precisam de uma faixa a partir de 0%.');
  return errors;
}

function NumberInput({ value, onChange, min = 0, max }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return <input type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))} />;
}

export function SettingsTab() {
  const { settings, updateSettings } = useAppData();
  const [s, setS] = useState<Settings>(settings);
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  useEffect(() => setS(settings), [settings]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setStatus(null);
    setS((prev) => ({ ...prev, [key]: value }));
  };
  const setSurveyItem = (i: number, p: Partial<SurveyItem>) =>
    set('survey', { ...s.survey, items: s.survey.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const setTier = (i: number, p: Partial<ResultTier>) => set('resultTiers', s.resultTiers.map((t, j) => (j === i ? { ...t, ...p } : t)));
  const sum = Object.values(s.distribution).reduce((a, b) => a + (b || 0), 0);
  const errors = validateSettings(s);

  async function save() {
    if (errors.length) {
      setStatus({ tone: 'error', text: errors.join(' ') });
      return;
    }
    await updateSettings({ ...s, resultTiers: s.resultTiers.slice().sort((a, b) => a.minPercent - b.minPercent) });
    setStatus({ tone: 'ok', text: 'Configurações salvas e aplicadas.' });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Card title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da instituição">
            <input value={s.institutionName} onChange={(e) => set('institutionName', e.target.value)} />
          </Field>
          <Field label="Nome do jogo">
            <input value={s.gameName} onChange={(e) => set('gameName', e.target.value)} />
          </Field>
          <Field label="Chamada principal">
            <input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Texto complementar">
            <textarea rows={2} value={s.intro} onChange={(e) => set('intro', e.target.value)} />
          </Field>
        </div>
        {(
          [
            ['logo', 'Logotipo colorido (telas brancas)', 'bg-white'],
            ['logoOnDark', 'Logotipo para fundo vinho (opcional)', 'bg-brand'],
          ] as const
        ).map(([key, label, preview]) => (
          <div key={key} className="mt-4 flex flex-wrap items-center gap-4">
            <div className={`flex h-24 w-56 items-center justify-center rounded-xl border border-dashed border-primary/40 p-2 ${preview}`}>
              {s[key] ? (
                <img src={s[key]} alt={label} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className={`text-center text-sm ${key === 'logo' ? 'text-ink/60' : 'text-white/70'}`}>Sem arquivo</span>
              )}
            </div>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-primary/25 bg-surface px-4 font-semibold">
              <Upload className="h-5 w-5" aria-hidden="true" /> {label}
              <input
                type="file"
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  if (f.size > 2 * 1024 * 1024) {
                    setStatus({ tone: 'error', text: 'Logotipo muito grande (máximo 2 MB).' });
                    return;
                  }
                  set(key, await readFileAsDataUrl(f));
                }}
              />
            </label>
            {s[key] && (
              <Btn tone="danger" onClick={() => set(key, '')}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
              </Btn>
            )}
          </div>
        ))}
        <div className="mt-4">
          <Field
            label="Link ao tocar no logotipo"
            hint="Abre em outra aba (no APK, no navegador do aparelho); o jogo continua aberto. Deixe vazio para o logotipo não ser clicável."
          >
            <input type="url" placeholder="https://" value={s.logoLinkUrl} onChange={(e) => set('logoLinkUrl', e.target.value.trim())} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink/60">
          Sem a versão para fundo vinho, o logotipo colorido aparece numa cápsula branca nas telas de início e resultado. Sem
          nenhum logotipo, aparece o nome da instituição em texto. Os arquivos ficam salvos no próprio aparelho.
        </p>
      </Card>

      <Card title="Cores" actions={<Btn onClick={() => set('colors', { ...DEFAULT_COLORS })}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Cores padrão</Btn>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((k) => (
            <Field key={k} label={COLOR_LABELS[k]}>
              <div className="flex items-center gap-2">
                <input type="color" value={s.colors[k]} onChange={(e) => set('colors', { ...s.colors, [k]: e.target.value })} />
                <input
                  className="w-28 font-mono"
                  value={s.colors[k]}
                  onChange={(e) => /^#[\da-f]{0,6}$/i.test(e.target.value) && set('colors', { ...s.colors, [k]: e.target.value })}
                />
              </div>
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Partida">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Perguntas por partida">
            <NumberInput value={s.questionsPerGame} min={1} max={50} onChange={(n) => set('questionsPerGame', n)} />
          </Field>
          <Field label="Pontos por resposta correta">
            <NumberInput value={s.pointsPerQuestion} min={1} onChange={(n) => set('pointsPerQuestion', n)} />
          </Field>
          <Field label="Evitar perguntas das últimas N partidas">
            <NumberInput value={s.avoidRecentGames} min={0} max={20} onChange={(n) => set('avoidRecentGames', n)} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={s.timePerQuestion > 0} onChange={(e) => set('timePerQuestion', e.target.checked ? 20 : 0)} /> Temporizador ativado
          </label>
          {s.timePerQuestion > 0 && (
            <Field label="Segundos por pergunta">
              <NumberInput value={s.timePerQuestion} min={5} max={300} onChange={(n) => set('timePerQuestion', n)} />
            </Field>
          )}
        </div>
        <h3 className="mt-6 font-semibold">
          Perguntas por categoria <span className={sum === s.questionsPerGame ? 'text-success' : 'text-gold'}>(soma: {sum} de {s.questionsPerGame})</span>
        </h3>
        <p className="text-xs text-ink/60">Se a soma for menor que o total, o restante é sorteado entre todas as categorias.</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Field key={c.id} label={c.label}>
              <NumberInput
                value={s.distribution[c.id] ?? 0}
                min={0}
                max={50}
                onChange={(n) => set('distribution', { ...s.distribution, [c.id as CategoryId]: n })}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card
        title="Pesquisa antes do desafio"
        actions={
          <Btn onClick={() => set('survey', structuredClone(DEFAULT_SETTINGS.survey))}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Textos padrão
          </Btn>
        }
      >
        <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={s.survey.enabled} onChange={(e) => set('survey', { ...s.survey, enabled: e.target.checked })} /> Mostrar a
            pesquisa antes do desafio
          </label>
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={s.survey.allowSkip} onChange={(e) => set('survey', { ...s.survey, allowSkip: e.target.checked })} /> Permitir
            pular
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {s.survey.items.map((it, i) => (
            <div key={it.id} className="grid gap-3 rounded-xl border border-primary/20 p-3">
              <Field label={`Pergunta ${i + 1}`} hint="Resposta em escala: Nunca ouvi falar · Já ouvi falar · Conheço um pouco · Conheço bem · Conheço muito bem.">
                <input value={it.prompt} onChange={(e) => setSurveyItem(i, { prompt: e.target.value })} />
              </Field>
              <Field label="Assunto, com artigo" hint={'Usado no resultado: "Você disse … sobre a Faculdade Donaduzzi".'}>
                <input value={it.subject} onChange={(e) => setSurveyItem(i, { subject: e.target.value })} />
              </Field>
              <Field label="Comparar com as perguntas da categoria">
                <select value={it.category ?? ''} onChange={(e) => setSurveyItem(i, { category: (e.target.value || null) as CategoryId | null })}>
                  <option value="">Não comparar</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/60">As respostas são anônimas e aparecem em Estatísticas.</p>
      </Card>

      <Card title="Totem">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inatividade durante a partida (s)" hint="Volta à tela inicial sem toques por esse tempo.">
            <NumberInput value={s.idleSeconds} min={15} onChange={(n) => set('idleSeconds', n)} />
          </Field>
          <Field label="Inatividade na tela de cursos (s)">
            <NumberInput value={s.coursesIdleSeconds} min={5} onChange={(n) => set('coursesIdleSeconds', n)} />
          </Field>
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={s.soundEnabled} onChange={(e) => set('soundEnabled', e.target.checked)} /> Efeitos sonoros
          </label>
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={s.fullscreenOnStart} onChange={(e) => set('fullscreenOnStart', e.target.checked)} /> Tela cheia ao iniciar
          </label>
        </div>
      </Card>

      <Card title="Tela de cursos e QR Code">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-4">
            <Field label="URL do QR Code" hint="Endereço oficial da página dos cursos. Deixe vazio para ocultar o QR Code.">
              <input type="url" placeholder="https://" value={s.qrUrl} onChange={(e) => set('qrUrl', e.target.value.trim())} />
            </Field>
            <Field label="Texto junto ao QR Code">
              <input value={s.qrLabel} onChange={(e) => set('qrLabel', e.target.value)} />
            </Field>
            <Field label="Título de destaque">
              <input value={s.coursesTitle} onChange={(e) => set('coursesTitle', e.target.value)} />
            </Field>
          </div>
          {s.qrUrl && <QrCode value={s.qrUrl} className="h-40 w-40" />}
        </div>
      </Card>

      <Card
        title="Mensagens de resultado"
        actions={
          <div className="flex gap-2">
            <Btn onClick={() => set('resultTiers', [...s.resultTiers, { minPercent: 50, title: 'NOVA FAIXA', message: '' }])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Faixa
            </Btn>
            <Btn onClick={() => set('resultTiers', structuredClone(DEFAULT_SETTINGS.resultTiers))}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Padrão
            </Btn>
          </div>
        }
      >
        <p className="mb-3 text-xs text-ink/60">
          Cada faixa vale a partir do percentual de acertos indicado (com 10 perguntas: 40% = 400 pontos).
        </p>
        <ul className="grid gap-3">
          {s.resultTiers.map((t, i) => (
            <li key={i} className="grid gap-3 rounded-xl border border-primary/20 p-3 sm:grid-cols-[7rem_1fr_2fr_auto]">
              <Field label="A partir de (%)">
                <NumberInput value={t.minPercent} min={0} max={100} onChange={(n) => setTier(i, { minPercent: Math.min(100, n) })} />
              </Field>
              <Field label="Título">
                <input value={t.title} onChange={(e) => setTier(i, { title: e.target.value })} />
              </Field>
              <Field label="Mensagem">
                <input value={t.message} onChange={(e) => setTier(i, { message: e.target.value })} />
              </Field>
              <Btn tone="danger" className="self-end" aria-label="Remover faixa" onClick={() => set('resultTiers', s.resultTiers.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Btn>
            </li>
          ))}
        </ul>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/20 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="mr-auto min-w-0 flex-1">{status && <Notice tone={status.tone}>{status.text}</Notice>}</div>
          <Btn onClick={() => setS(settings)}>Descartar alterações</Btn>
          <Btn tone="primary" onClick={() => void save()}>
            Salvar configurações
          </Btn>
        </div>
      </div>
    </div>
  );
}
