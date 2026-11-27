<script lang="ts">
  import type { Collection, SectionType } from "@ecc/firestore";
  import { SvelteSet } from "svelte/reactivity";
  import Button from "#lib/components/button.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { adminThumb, filterItems, isSection, type Item, type Sort, type Visibility } from "./admin-items.ts";
  import { setHidden, summaries } from "./admin.remote";
  import ItemPanel from "./item-panel.svelte";

  /** Cards rendered at once; "show more" adds another page. */
  const PAGE = 60;
  /** `setHidden` accepts at most this many ids per call. */
  const BATCH = 100;

  const COLLECTIONS: { value: Collection; label: string }[] = [
    { value: "sections", label: "sections" },
    { value: "corpses", label: "corpses" },
  ];
  const VISIBILITIES: Visibility[] = ["all", "visible", "hidden"];
  const TYPES: (SectionType | "all")[] = ["all", "top", "mid", "bot"];
  const SORTS: Sort[] = ["newest", "likes"];
  const SHORTCUTS = "j/k move ▪ enter open ▪ x select ▪ h hide/unhide ▪ / search ▪ esc close";

  let collection = $state<Collection>("sections");
  let visibility = $state<Visibility>("all");
  let type = $state<SectionType | "all">("all");
  let sort = $state<Sort>("newest");
  let search = $state("");
  let limit = $state(PAGE);
  let focus = $state(0);
  let open = $state<{ collection: Collection; id: string } | null>(null);
  let message = $state<string | null>(null);
  let busy = $state(false);
  const selected = new SvelteSet<string>();

  const data = $derived(await summaries());
  const source = $derived<Item[]>(collection === "sections" ? data.sections : data.corpses);
  const items = $derived(filterItems(source, { collection, visibility, type, sort, search }));
  const shown = $derived(items.slice(0, limit));
  const counts = $derived({
    sections: data.sections.length,
    corpses: data.corpses.length,
    hidden: data.sections.filter((item) => item.hidden).length + data.corpses.filter((item) => item.hidden).length,
  });

  /** The open item, looked up fresh so it updates after hide/unhide. */
  const openItem = $derived.by(() => {
    if (!open) return null;
    const list: Item[] = open.collection === "sections" ? data.sections : data.corpses;
    return list.find((item) => item.id === open!.id) ?? null;
  });

  /** Changing a filter starts over: first page, first card, nothing selected. */
  function filter(change: () => void) {
    change();
    limit = PAGE;
    focus = 0;
    selected.clear();
  }

  function showArtist(artist: string) {
    filter(() => {
      collection = "sections";
      search = artist;
    });
  }

  function openAt(index: number) {
    const item = shown[index];
    if (item) open = { collection, id: item.id };
  }

  function toggleSelect(id: string) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
  }

  async function hideMany(ids: string[], hidden: boolean) {
    if (ids.length === 0) return;
    busy = true;
    message = null;
    try {
      let cascaded = 0;
      for (let start = 0; start < ids.length; start += BATCH) {
        const result = await setHidden({ collection, ids: ids.slice(start, start + BATCH), hidden });
        cascaded += result.cascaded.length;
      }
      const noun = ids.length === 1 ? collection.slice(0, -1) : collection;
      const also = cascaded ? ` (+${cascaded} corpse${cascaded === 1 ? "" : "s"})` : "";
      message = `${hidden ? "hid" : "unhid"} ${ids.length} ${noun}${also}`;
      selected.clear();
    } catch (cause) {
      message = cause instanceof Error ? cause.message : "request failed";
    } finally {
      busy = false;
    }
  }

  /** Hide/unhide the selection, or the focused card when nothing is selected. */
  function toggleHideFocused() {
    if (selected.size > 0) {
      const chosen = source.filter((item) => selected.has(item.id));
      const hide = chosen.some((item) => !item.hidden);
      return hideMany(chosen.map((item) => item.id), hide);
    }
    const item = shown[focus];
    if (item) return hideMany([item.id], !item.hidden);
  }

  function onkeydown(event: KeyboardEvent) {
    const target = event.target;
    const typing = target instanceof HTMLElement && target.matches("input, textarea, select");

    if (event.key === "Escape") {
      if (typing) target.blur();
      else if (open) open = null;
      else selected.clear();
      return;
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey || busy) return;

    const keys: Record<string, () => void> = {
      "/": () => document.getElementById("admin-search")?.focus(),
      j: () => (focus = Math.min(focus + 1, shown.length - 1)),
      ArrowRight: () => (focus = Math.min(focus + 1, shown.length - 1)),
      k: () => (focus = Math.max(focus - 1, 0)),
      ArrowLeft: () => (focus = Math.max(focus - 1, 0)),
      Enter: () => openAt(focus),
      o: () => openAt(focus),
      x: () => shown[focus] && toggleSelect(shown[focus].id),
      h: () => void toggleHideFocused(),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  // Keep the focused card on screen while moving with the keyboard.
  $effect(() => {
    document.querySelector(`[data-index="${focus}"]`)?.scrollIntoView({ block: "nearest" });
  });
</script>

<svelte:window {onkeydown} />

<Panel class="admin-index browser-controls">
  <div class="controls">
    <p class="counts">
      {counts.sections} sections ▪ {counts.corpses} corpses ▪ {counts.hidden} hidden
    </p>

    <div class="row">
      {#each COLLECTIONS as option (option.value)}
        <button
          class="chip"
          class:active={collection === option.value}
          onclick={() => filter(() => (collection = option.value))}>{option.label}</button
        >
      {/each}
      <span class="sep"></span>
      {#each VISIBILITIES as option (option)}
        <button class="chip" class:active={visibility === option} onclick={() => filter(() => (visibility = option))}
          >{option}</button
        >
      {/each}
      <span class="sep"></span>
      {#each SORTS as option (option)}
        <button class="chip" class:active={sort === option} onclick={() => filter(() => (sort = option))}
          >{option}</button
        >
      {/each}
    </div>

    {#if collection === "sections"}
      <div class="row">
        {#each TYPES as option (option)}
          <button class="chip" class:active={type === option} onclick={() => filter(() => (type = option))}
            >{option}</button
          >
        {/each}
      </div>
    {/if}

    <input
      id="admin-search"
      type="search"
      placeholder="search title, artist or id (or paste a link)"
      value={search}
      oninput={(event) => filter(() => (search = event.currentTarget.value))}
    />

    <p class="hint">{items.length} shown ▪ {SHORTCUTS}</p>
  </div>
</Panel>

{#if selected.size > 0}
  <Panel class="admin-index bulk" color="blue">
    <div class="row">
      <strong>{selected.size} selected</strong>
      <Button disabled={busy} onclick={() => hideMany([...selected], true)} text="hide" />
      <Button disabled={busy} color="green" onclick={() => hideMany([...selected], false)} text="unhide" />
      <Button onclick={() => selected.clear()} text="clear" />
    </div>
  </Panel>
{/if}

{#if message}
  <Panel class="admin-index"><p role="status">{message}</p></Panel>
{/if}

<div class="workspace" class:with-panel={openItem}>
  <div class="grid">
    {#each shown as item, index (item.id)}
      <div class="card" class:focused={index === focus} class:hidden={item.hidden} data-index={index}>
        <button
          class="thumb"
          onclick={() => {
            focus = index;
            openAt(index);
          }}
        >
          <img
            src={adminThumb(collection, item)}
            alt={item.title}
            loading="lazy"
            width={540}
            height={collection === "corpses" ? 540 : 180}
          />
          {#if item.hidden}<span class="badge">hidden</span>{/if}
        </button>
        <label class="caption">
          <input type="checkbox" checked={selected.has(item.id)} onchange={() => toggleSelect(item.id)} />
          <span>
            {item.title}
            {#if isSection(item)}<small>by {item.artist} ▪ {item.type}</small>{/if}
            <small>{new Date(item.date).toLocaleDateString()} ▪ ♥ {item.likes}</small>
          </span>
        </label>
      </div>
    {:else}
      <p>nothing matches</p>
    {/each}
  </div>

  {#if openItem && open}
    <aside>
      <ItemPanel
        collection={open.collection}
        item={openItem}
        onopen={(next, id) => (open = { collection: next, id })}
        onartist={showArtist}
        onclose={() => (open = null)}
      />
    </aside>
  {/if}
</div>

{#if shown.length < items.length}
  <div class="more">
    <Button onclick={() => (limit += PAGE)} text={`show more (${items.length - shown.length} left)`} />
  </div>
{/if}

<style lang="scss">
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .sep {
    width: 1rem;
  }

  .chip {
    padding: 0.125rem 0.5rem;
    border: 2px solid var(--black);
    font-size: 0.875rem;

    &.active {
      background: var(--black);
      color: var(--white);
    }
  }

  input[type="search"] {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--black);
    background: var(--white);
  }

  .counts,
  .hint {
    font-size: 0.875rem;
  }

  .hint {
    opacity: 0.6;
  }

  .workspace {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;

    &.with-panel {
      grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
      align-items: start;

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
      }
    }
  }

  aside {
    position: sticky;
    top: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    align-content: start;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem;
    border: 2px solid transparent;

    &.focused {
      border-color: var(--blue);
    }

    &.hidden img {
      opacity: 0.35;
    }
  }

  .thumb {
    position: relative;
    display: block;

    img {
      display: block;
      width: 100%;
      height: auto;
      border: 2px solid var(--black);
      background: var(--white);
    }
  }

  .badge {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    padding: 0 0.25rem;
    background: var(--red);
    color: var(--white);
    font-size: 0.75rem;
  }

  .caption {
    display: flex;
    gap: 0.375rem;
    align-items: start;
    font-size: 0.8125rem;
    overflow-wrap: anywhere;

    small {
      display: block;
      opacity: 0.6;
    }
  }

  .more {
    margin-top: 1rem;
  }
</style>
