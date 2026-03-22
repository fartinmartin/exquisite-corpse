export type Variant = 'accent' | 'neutral' | 'error' | 'info' | 'success' | 'warning';

export type Appearance = 'solid' | 'soft' | 'soft-outlined' | 'outlined' | 'ghost' | 'link';

export type Size = 'xs' | 'sm' | 'md' | 'lg';

let counter = 0;
export function uid(prefix = 'sc') {
  return `${prefix}-${(++counter).toString(36)}`;
}
