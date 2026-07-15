import {
  Dna,
  Atom,
  FlaskConical,
  Ruler,
  FileText
} from 'lucide-react';

export const SUBJECT_META = {
  svt: {
    Icon: Dna,
    label: 'SVT',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  physique: {
    Icon: Atom,
    label: 'Physique',
    color: '#0ea5e9',
    bg: '#eff6ff',
  },
  chimie: {
    Icon: FlaskConical,
    label: 'Chimie',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  mathematiques: {
    Icon: Ruler,
    label: 'Maths',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
};

export const DEFAULT_SUBJECT_META = {
  Icon: FileText,
  label: 'Matiere',
  color: '#0891a3',
  bg: '#ecfeff',
};

export const getSubjectMeta = (subject) => {
  return SUBJECT_META[subject] || {
    ...DEFAULT_SUBJECT_META,
    label: subject || DEFAULT_SUBJECT_META.label,
  };
};