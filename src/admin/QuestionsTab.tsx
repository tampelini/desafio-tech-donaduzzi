import { useMemo, useRef, useState } from 'react';
import { Download, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import type { CategoryId, Question } from '../types';
import { useAppData } from '../store/AppDataContext';
import { CATEGORIES, categoryLabel } from '../data/categories';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { parseQuestionBank } from '../services/validation';
import { downloadText, newId, readFileAsText, timestampForFile } from '../services/files';
import { QuestionEditor } from './QuestionEditor';
import { Btn, Card, Notice } from './ui';

export function QuestionsTab() {
  const { questions, updateQuestions, settings } = useAppData();
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Question | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error' | 'warn'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importMode = useRef<'replace' | 'merge'>('merge');

  const list = useMemo(() => {
    const s = search.trim().toLowerCase();
    return questions.filter(
      (q) =>
        (filter === 'all' || q.category === filter) &&
        (status === 'all' || (status === 'active' ? q.active : !q.active)) &&
        (!s || q.prompt.toLowerCase().includes(s) || q.id.toLowerCase().includes(s)),
    );
  }, [questions, filter, status, search]);

  const shortages = CATEGORIES.filter((c) => {
    const need = settings.distribution[c.id] ?? 0;
    return need > 0 && questions.filter((q) => q.active && q.category === c.id).length < need;
  });

  async function save(q: Question) {
    const exists = questions.some((x) => x.id === (isNew ? q.id : editing?.id));
    const next = isNew || !exists ? [...questions, q] : questions.map((x) => (x.id === editing?.id ? q : x));
    await updateQuestions(next);
    setEditing(null);
    setMessage({ tone: 'ok', text: `Pergunta "${q.id}" salva.` });
  }

  async function remove(q: Question) {
    if (!window.confirm(`Excluir definitivamente a pergunta "${q.prompt}"?`)) return;
    await updateQuestions(questions.filter((x) => x.id !== q.id));
    setMessage({ tone: 'ok', text: 'Pergunta excluída.' });
  }

  async function toggle(q: Question) {
    await updateQuestions(questions.map((x) => (x.id === q.id ? { ...x, active: !x.active } : x)));
  }

  async function onImport(file: File) {
    const { questions: imported, errors } = parseQuestionBank(await readFileAsText(file));
    if (!imported.length) {
      setMessage({ tone: 'error', text: errors.join(' ') || 'Nenhuma pergunta válida encontrada.' });
      return;
    }
    let next: Question[];
    if (importMode.current === 'replace') next = imported;
    else {
      const byId = new Map(questions.map((q) => [q.id, q]));
      imported.forEach((q) => byId.set(q.id, q));
      next = [...byId.values()];
    }
    await updateQuestions(next);
    setMessage({
      tone: errors.length ? 'warn' : 'ok',
      text: `${imported.length} pergunta(s) importada(s).${errors.length ? ` ${errors.length} ignorada(s): ${errors.slice(0, 3).join(' | ')}` : ''}`,
    });
  }

  const startImport = (mode: 'replace' | 'merge') => {
    importMode.current = mode;
    fileRef.current?.click();
  };

  if (editing) {
    return (
      <QuestionEditor
        initial={editing}
        isNew={isNew}
        otherIds={questions.filter((q) => q.id !== editing.id).map((q) => q.id)}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {shortages.length > 0 && (
        <Notice tone="warn">
          Perguntas ativas insuficientes para a distribuição configurada em: {shortages.map((c) => c.label).join(', ')}. O sorteio completará
          com outras categorias.
        </Notice>
      )}

      <Card
        title={`Banco de perguntas (${questions.filter((q) => q.active).length} ativas de ${questions.length})`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Btn
              tone="primary"
              onClick={() => {
                setIsNew(true);
                setEditing({
                  id: newId('q-'),
                  category: filter === 'all' ? 'faculdade' : filter,
                  prompt: '',
                  options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: '' })),
                  correctOptionId: 'a',
                  explanation: '',
                  active: true,
                });
              }}
            >
              <Plus className="h-5 w-5" aria-hidden="true" /> Nova pergunta
            </Btn>
            <Btn onClick={() => downloadText(`perguntas-${timestampForFile()}.json`, JSON.stringify(questions, null, 2), 'application/json')}>
              <Download className="h-5 w-5" aria-hidden="true" /> Exportar JSON
            </Btn>
            <Btn onClick={() => startImport('merge')}>
              <Upload className="h-5 w-5" aria-hidden="true" /> Importar (mesclar)
            </Btn>
            <Btn onClick={() => startImport('replace')}>
              <Upload className="h-5 w-5" aria-hidden="true" /> Importar (substituir)
            </Btn>
            <Btn
              onClick={async () => {
                if (!window.confirm('Restaurar as 60 perguntas originais? As alterações no banco serão perdidas.')) return;
                await updateQuestions(structuredClone(DEFAULT_QUESTIONS));
                setMessage({ tone: 'ok', text: 'Banco original restaurado.' });
              }}
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" /> Restaurar padrão
            </Btn>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = '';
              }}
            />
          </div>
        }
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value as CategoryId | 'all')} aria-label="Filtrar por categoria">
            <option value="all">Todas as categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({questions.filter((q) => q.category === c.id).length})
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filtrar por status">
            <option value="all">Ativas e inativas</option>
            <option value="active">Somente ativas</option>
            <option value="inactive">Somente inativas</option>
          </select>
          <input type="search" placeholder="Buscar por texto ou ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <ul className="divide-y divide-primary/15">
          {list.map((q) => {
            const correct = q.options.find((o) => o.id === q.correctOptionId);
            return (
              <li key={q.id} className={`flex flex-wrap items-start gap-3 py-3 ${q.active ? '' : 'opacity-55'}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-primary">
                    {q.id} · {categoryLabel(q.category)}
                  </p>
                  <p className="font-semibold">{q.prompt}</p>
                  <p className="text-sm text-success">✔ {correct?.text}</p>
                </div>
                <label className="flex min-h-[44px] items-center gap-2 text-sm">
                  <input type="checkbox" checked={q.active} onChange={() => void toggle(q)} /> Ativa
                </label>
                <Btn
                  aria-label={`Editar ${q.id}`}
                  onClick={() => {
                    setIsNew(false);
                    setEditing(q);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                </Btn>
                <Btn tone="danger" aria-label={`Excluir ${q.id}`} onClick={() => void remove(q)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Btn>
              </li>
            );
          })}
          {list.length === 0 && <li className="py-6 text-center text-ink/60">Nenhuma pergunta encontrada.</li>}
        </ul>
      </Card>
    </div>
  );
}
