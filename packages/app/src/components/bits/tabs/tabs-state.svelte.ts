import { getContext, setContext } from 'svelte';

let uid = 0;

export type TabsVariant = 'pill' | 'underline';

class TabsState {
  activeTab = $state<string>('');
  readonly id: string;
  readonly variant: TabsVariant;

  constructor(defaultValue: string, variant: TabsVariant = 'pill') {
    this.activeTab = defaultValue;
    this.variant = variant;
    this.id = `tabs-${uid++}`;
  }

  isActive(value: string) {
    return this.activeTab === value;
  }

  activate(value: string) {
    this.activeTab = value;
  }

  triggerId(value: string) {
    return `${this.id}-trigger-${value}`;
  }

  panelId(value: string) {
    return `${this.id}-panel-${value}`;
  }
}

const TABS_KEY = Symbol('tabs');

export function createTabs(defaultValue: string, variant?: TabsVariant) {
  const state = new TabsState(defaultValue, variant);
  setContext(TABS_KEY, state);
  return state;
}

export function useTabs() {
  return getContext<TabsState>(TABS_KEY);
}
