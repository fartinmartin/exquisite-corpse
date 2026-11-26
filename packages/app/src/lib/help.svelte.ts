function createHelp() {
  let open = $state(false);

  return {
    get open() {
      return open;
    },
    show() {
      open = true;
    },
    hide() {
      open = false;
    },
    toggle() {
      open = !open;
    },
  };
}

export const help = createHelp();
