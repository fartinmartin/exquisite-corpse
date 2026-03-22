// Variant matches the semantic color groups in design-tokens/colors.json
// and the light-dark() pairs in styles/themes/default.css.
export type Variant = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export type Appearance = 'soft' | 'soft-outlined' | 'outlined' | 'ghost' | 'link';

export type Size = 'xs' | 'sm' | 'md' | 'lg';

let _counter = 0;
export function uid(prefix = 'id') {
  return `${prefix}-${++_counter}`;
}
