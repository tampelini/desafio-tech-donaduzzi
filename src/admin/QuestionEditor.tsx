import { useState } from 'react';
import type { CategoryId, Question } from '../types';
import { CATEGORIES } from '../data/categories';
import { validateQuestion } from '../services/validation';
import { Btn, Card, Field, Notice } from './ui';

interface Props {
  initial: Question;
  isNew: boolean;
  otherIds: string[];
  onSave: (q: Question) => void | Promise<void>;
  onCancel: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuestionEditor({ initial, isNew, otherIds, onSave, onCancel }: Props) {
  const [q, setQ] = useState<Question>(() => structuredClone(initial));
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof Question>(key: K, value: Question[K]) => setQ((prev) => ({ ...prev, [key]: value }));

  function submit() {
    const clean: Question = {
      ...q,
      id: q.id.trim(),
      prompt: q.prompt.trim(),
      explanation: q.explanation.trim(),
      options: q.options.map((o) => ({ ...o, text: o.text.trim() })),
    };
    const errs = validateQuestion(clean, otherIds);
    setErrors(errs);
    if (!errs.length) void onSave(clean);
  }

  return (
    <Card title={isNew ? 'Nova pergunta' : `Editar pergunta ${initial.id}`}>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {errors.length > 0 && (
          <Notice tone="error">
            <ul className="list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ID único" hint="Letras, números, hífen ou sublinhado.">
            <input value={q.id} onChange={(e) => set('id', e.target.value)} disabled={!isNew} />
          </Field>
          <Field label="Categoria">
            <select value={q.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Enunciado">
          <textarea rows={2} value={q.prompt} onChange={(e) => set('prompt', e.target.value)} />
        </Field>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-semibold">Alternativas (marque a correta)</legend>
          {q.options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-3">
              <label className="flex min-h-[44px] items-center gap-2 font-bold">
                <input
                  type="radio"
                  name="correct"
                  checked={q.correctOptionId === opt.id}
                  onChange={() => set('correctOptionId', opt.id)}
                  aria-label={`Marcar alternativa ${LETTERS[i]} como correta`}
                  className="h-6 w-6 accent-[rgb(var(--c-success))]"
                />
                {LETTERS[i]}
              </label>
              <input
                className="flex-1"
                value={opt.text}
                aria-label={`Texto da alternativa ${LETTERS[i]}`}
                onChange={(e) => set('options', q.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)))}
              />
            </div>
          ))}
        </fieldset>

        <Field label="Explicação educativa (1 ou 2 frases)">
          <textarea rows={2} value={q.explanation} onChange={(e) => set('explanation', e.target.value)} />
        </Field>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={q.active} onChange={(e) => set('active', e.target.checked)} /> Pergunta ativa
        </label>
        <div className="flex gap-3">
          <Btn tone="primary" type="submit">
            Salvar pergunta
          </Btn>
          <Btn onClick={onCancel}>Cancelar</Btn>
        </div>
      </form>
    </Card>
  );
}
