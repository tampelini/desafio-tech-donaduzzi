import type { ComponentType } from 'react';
import { Brain, Code2, Cpu, Database, FlaskConical, GraduationCap, HeartPulse, MonitorSmartphone, type LucideProps } from 'lucide-react';
import type { CourseIcon as IconName } from '../types';

export const COURSE_ICONS: Record<IconName, { label: string; Icon: ComponentType<LucideProps> }> = {
  database: { label: 'Dados', Icon: Database },
  brain: { label: 'Cérebro / IA', Icon: Brain },
  code: { label: 'Código', Icon: Code2 },
  monitor: { label: 'Sistemas', Icon: MonitorSmartphone },
  cpu: { label: 'Processador', Icon: Cpu },
  graduation: { label: 'Formatura', Icon: GraduationCap },
  flask: { label: 'Laboratório', Icon: FlaskConical },
  heart: { label: 'Saúde', Icon: HeartPulse },
};

export function CourseIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const { Icon } = COURSE_ICONS[name] ?? COURSE_ICONS.graduation;
  return <Icon aria-hidden="true" {...props} />;
}
