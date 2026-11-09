import type { ComponentType } from 'react';
import {
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Cpu,
  Database,
  Dna,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  MonitorSmartphone,
  Pill,
  Scale,
  Users,
  type LucideProps,
} from 'lucide-react';
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
  briefcase: { label: 'Gestão', Icon: Briefcase },
  book: { label: 'Educação', Icon: BookOpen },
  dna: { label: 'Biotecnologia', Icon: Dna },
  pill: { label: 'Farmácia', Icon: Pill },
  users: { label: 'Pessoas', Icon: Users },
  scale: { label: 'Direito', Icon: Scale },
};

export function CourseIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const { Icon } = COURSE_ICONS[name] ?? COURSE_ICONS.graduation;
  return <Icon aria-hidden="true" {...props} />;
}
