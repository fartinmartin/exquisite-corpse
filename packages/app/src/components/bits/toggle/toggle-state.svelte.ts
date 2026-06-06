import { getContext, setContext } from 'svelte';

let uid = 0;

class ToggleGroupState {
  value = $state<string>('');
  readonly id: string;

  constructor(defaultValue: string) {
    this.value = defaultValue;
    this.id = `toggle-group-${uid++}`;
  }

  isActive(value: string) {
    return this.value === value;
  }

  activate(value: string) {
    this.value = value;
  }
}

const TOGGLE_GROUP_KEY = Symbol('toggle-group');

export function createToggleGroup(defaultValue: string) {
  const state = new ToggleGroupState(defaultValue);
  setContext(TOGGLE_GROUP_KEY, state);
  return state;
}

export function useToggleGroup(): ToggleGroupState | undefined {
  return getContext<ToggleGroupState>(TOGGLE_GROUP_KEY);
}
