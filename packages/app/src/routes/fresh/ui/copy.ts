/**
 * Copy text, true if it worked. The Clipboard API only exists on https and
 * localhost (not, say, the dev server opened over Wi-Fi), so fall back to the
 * old select-and-copy there.
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    const ok = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
    if (ok) return true;
  }
  return selectAndCopy(text);
}

function selectAndCopy(text: string): boolean {
  const focused = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true; // no keyboard on phones
  field.style.cssText = "position:fixed;top:0;opacity:0";
  document.body.append(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  focused?.focus({ preventScroll: true });
  return ok;
}
