import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { Course, CourseIcon as IconName } from '../types';
import { useAppData } from '../store/AppDataContext';
import { DEFAULT_COURSES } from '../data/courses';
import { COURSE_ICONS, CourseIcon } from '../components/CourseIcon';
import { newId } from '../services/files';
import { Btn, Card, Field, Notice } from './ui';

export function CoursesTab() {
  const { courses, updateCourses } = useAppData();
  const [draft, setDraft] = useState<Course[]>(courses);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(courses), [courses]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(courses);
  const invalid = draft.some((c) => !c.name.trim() || !c.description.trim());

  const patch = (id: string, p: Partial<Course>) => {
    setSaved(false);
    setDraft((d) => d.map((c) => (c.id === id ? { ...c, ...p } : c)));
  };
  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.length) return d;
      const n = d.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="flex flex-col gap-4">
      <Notice tone="info">
        Cadastre apenas cursos efetivamente ofertados. Não informe duração, modalidade, vagas ou autorização sem dados institucionais
        confirmados. Cursos desativados não aparecem no totem.
      </Notice>
      {saved && <Notice tone="ok">Cursos salvos.</Notice>}
      <Card
        title="Cursos exibidos na tela final"
        actions={
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={() =>
                setDraft((d) => [...d, { id: newId('curso-'), name: 'Novo curso', description: 'Descrição do curso.', icon: 'graduation', enabled: false }])
              }
            >
              <Plus className="h-5 w-5" aria-hidden="true" /> Adicionar curso
            </Btn>
            <Btn onClick={() => window.confirm('Restaurar os quatro cursos padrão?') && setDraft(structuredClone(DEFAULT_COURSES))}>
              <RotateCcw className="h-5 w-5" aria-hidden="true" /> Restaurar padrão
            </Btn>
            <Btn
              tone="primary"
              disabled={!dirty || invalid}
              onClick={async () => {
                await updateCourses(draft);
                setSaved(true);
              }}
            >
              Salvar cursos
            </Btn>
          </div>
        }
      >
        <ul className="grid gap-4">
          {draft.map((c, i) => (
            <li key={c.id} className={`rounded-xl border border-primary/20 p-4 ${c.enabled ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-bg">
                  <CourseIcon name={c.icon} className="h-6 w-6" />
                </span>
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={c.enabled} onChange={(e) => patch(c.id, { enabled: e.target.checked })} /> Exibir no totem
                </label>
                <div className="ml-auto flex gap-2">
                  <Btn aria-label="Mover para cima" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Btn>
                  <Btn aria-label="Mover para baixo" onClick={() => move(i, 1)} disabled={i === draft.length - 1}>
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </Btn>
                  <Btn tone="danger" aria-label="Remover curso" onClick={() => window.confirm(`Remover "${c.name}"?`) && setDraft((d) => d.filter((x) => x.id !== c.id))}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Btn>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
                <Field label="Nome do curso">
                  <input value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} />
                </Field>
                <Field label="Ícone">
                  <select value={c.icon} onChange={(e) => patch(c.id, { icon: e.target.value as IconName })}>
                    {Object.entries(COURSE_ICONS).map(([id, { label }]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Descrição">
                  <textarea rows={2} value={c.description} onChange={(e) => patch(c.id, { description: e.target.value })} />
                </Field>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
