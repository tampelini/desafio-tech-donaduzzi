import { Download } from 'lucide-react';
import type { SurveySummary } from '../services/stats';
import { surveyToCsv } from '../services/stats';
import { SURVEY_SCALE } from '../data/survey';
import { categoryLabel } from '../data/categories';
import { downloadText, timestampForFile } from '../services/files';
import { Btn, Card } from './ui';

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—');
const avg = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Relatório da pesquisa "o quanto você conhece…" (Biopark e Faculdade). */
export function SurveyStats({ summary, enabled }: { summary: SurveySummary; enabled: boolean }) {
  return (
    <Card
      title="Pesquisa: o quanto os visitantes conhecem"
      actions={
        <Btn onClick={() => downloadText(`pesquisa-${timestampForFile()}.csv`, surveyToCsv(summary), 'text/csv')}>
          <Download className="h-4 w-4" aria-hidden="true" /> CSV da pesquisa
        </Btn>
      }
    >
      {!enabled && <p className="mb-3 text-sm text-gold">A pesquisa está desligada (Configurações → Pesquisa antes do desafio).</p>}
      <div className="mb-5 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <span>
          <strong className="font-display text-2xl">{summary.answered}</strong> responderam
        </span>
        <span>
          <strong className="font-display text-2xl">{summary.skipped}</strong> pularam ({pct(summary.skipped, summary.shown)})
        </span>
      </div>

      {summary.answered === 0 ? (
        <p className="py-4 text-center text-ink/60">Ainda não há respostas da pesquisa.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {summary.items.map((s) => {
            const max = Math.max(1, ...s.counts);
            const crossRows = s.cross.filter((c) => c.games > 0);
            return (
              <section key={s.item.id} aria-label={s.item.prompt} className="rounded-xl border border-primary/20 bg-bg/40 p-4">
                <h3 className="font-display text-base font-bold">{s.item.prompt}</h3>
                <p className="mb-3 text-sm text-ink/70">
                  Média <strong className="text-lg text-primary">{avg(s.average)}</strong> de 5 · {s.responses} respostas
                </p>
                <ul className="flex flex-col gap-2">
                  {SURVEY_SCALE.map((label, i) => (
                    <li key={label} className="grid grid-cols-[9.5rem_1fr_5.5rem] items-center gap-2 text-sm">
                      <span>
                        {i + 1} · {label}
                      </span>
                      <span className="h-4 overflow-hidden rounded-full bg-primary/10">
                        <span className="block h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(s.counts[i] / max) * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums">
                        {s.counts[i]} ({pct(s.counts[i], s.responses)})
                      </span>
                    </li>
                  ))}
                </ul>
                {s.item.category && crossRows.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-1 text-sm font-semibold">Acerto nas perguntas de “{categoryLabel(s.item.category)}”, por resposta</p>
                    <table className="w-full text-left text-sm">
                      <tbody>
                        {crossRows.map((c) => (
                          <tr key={c.rating} className="border-t border-primary/15">
                            <td className="py-1 pr-2">
                              {c.rating} · {SURVEY_SCALE[c.rating - 1]}
                            </td>
                            <td className="py-1 pr-2 font-semibold">{pct(c.correct, c.total)} de acerto</td>
                            <td className="py-1 text-ink/60">{c.games} {c.games === 1 ? 'partida' : 'partidas'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}
