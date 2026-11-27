<script lang="ts">
  import type { Collection, Corpse, Section } from "@ecc/firestore";
  import Button from "#lib/components/button.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { adminThumb, isSection, publicHref, type Item } from "./admin-items.ts";
  import {
    corpseDeletePreview,
    deleteCorpse,
    deleteSection,
    downloadPaths,
    makeCorpse,
    sectionDeletePreview,
    setHidden,
    updateThumb,
  } from "./admin.remote";
  import CopyId from "./copy-id.svelte";

  /** A status line; `id` is shown click-to-copy between `text` and `after`. */
  type Message = { text: string; id?: string; after?: string };

  type Props = {
    collection: Collection;
    item: Item;
    /** Opens another item (a related section or corpse) in this panel. */
    onopen: (collection: Collection, id: string) => void;
    /** Show only this artist's sections in the browser. */
    onartist: (artist: string) => void;
    onclose: () => void;
  };

  let { collection, item, onopen, onartist, onclose }: Props = $props();

  /** Everything a pending delete would remove, shown before confirming. */
  let pendingDelete = $state.raw<{ section?: Section; corpses: Corpse[] } | null>(null);
  let busy = $state(false);
  let message = $state.raw<Message | null>(null);

  const date = $derived(new Date(item.date).toLocaleString());

  async function run(action: () => Promise<string | Message>) {
    busy = true;
    message = null;
    try {
      const result = await action();
      message = typeof result === "string" ? { text: result } : result;
    } catch (cause) {
      message = { text: cause instanceof Error ? cause.message : "request failed" };
    } finally {
      busy = false;
    }
  }

  function toggleHidden() {
    const hidden = !item.hidden;
    return run(async () => {
      const { cascaded } = await setHidden({ collection, ids: [item.id], hidden });
      const also = cascaded.length ? ` (and ${cascaded.length} corpse${cascaded.length === 1 ? "" : "s"})` : "";
      return `${hidden ? "hidden" : "visible again"}${also}`;
    });
  }

  function previewDelete() {
    return run(async () => {
      pendingDelete =
        collection === "sections"
          ? await sectionDeletePreview(item.id)
          : { corpses: [await corpseDeletePreview(item.id)] };
      return "check what will be deleted";
    });
  }

  function confirmDelete() {
    pendingDelete = null;
    return run(async () => {
      if (collection === "sections") await deleteSection(item.id);
      else await deleteCorpse(item.id);
      onclose();
      return "deleted";
    });
  }

  function rerender() {
    return run(async () => {
      await updateThumb(item.id);
      return "thumb will re-render on next view";
    });
  }

  function corpseFrom() {
    return run(async () => {
      const { corpseId } = await makeCorpse(item.id);
      onopen("corpses", corpseId);
      return { text: "made corpse", id: corpseId };
    });
  }

  function exportPaths() {
    return run(async () => {
      const { drawing } = await downloadPaths(item.id);
      const blob = new Blob([JSON.stringify(drawing)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${item.id}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      return { text: "downloaded", id: item.id, after: ".json" };
    });
  }
</script>

<Panel class="item-panel" color={item.hidden ? "red" : "yellow"}>
  <div class="layout">
    <header>
      <h1>{item.title}</h1>
      <button class="close" onclick={onclose} aria-label="close">✕</button>
    </header>

    <img
      class:corpse={collection === "corpses"}
      src={adminThumb(collection, item)}
      alt={item.title}
      width={540}
      height={collection === "corpses" ? 540 : 180}
    />

    <dl>
      {#if isSection(item)}
        <dt>artist</dt>
        <dd><button class="link" onclick={() => onartist(item.artist)}>{item.artist}</button></dd>
        <dt>type</dt>
        <dd>{item.type}</dd>
      {/if}
      <dt>id</dt>
      <dd><CopyId id={item.id} /></dd>
      <dt>date</dt>
      <dd>{date}</dd>
      <dt>likes</dt>
      <dd>{item.likes}</dd>
      <dt>status</dt>
      <dd>
        {#if !item.hidden}
          visible
        {:else if !isSection(item) && item.hiddenBy?.startsWith("section:")}
          {@const sectionId = item.hiddenBy.slice(8)}
          hidden with section
          <CopyId id={sectionId} onopen={() => onopen("sections", sectionId)} />
        {:else}
          hidden
        {/if}
      </dd>
      {#if isSection(item)}
        <dt>in corpses</dt>
        <dd class="links">
          {#each item.featuredIn as id (id)}
            <CopyId {id} onopen={() => onopen("corpses", id)} />
          {:else}
            none
          {/each}
        </dd>
      {:else}
        <dt>sections</dt>
        <dd class="links">
          {#each Object.entries(item.sections) as [type, id] (type)}
            <button class="link" onclick={() => onopen("sections", id)}>{type}</button>
          {/each}
        </dd>
      {/if}
    </dl>

    <p><a href={publicHref(collection, item.id)} target="_blank" rel="noopener">open public page ↗</a></p>

    <div class="actions">
      <Button
        color={item.hidden ? "green" : "yellow"}
        disabled={busy}
        onclick={toggleHidden}
        text={item.hidden ? "unhide" : "hide"}
      />
      {#if isSection(item)}
        <Button disabled={busy} onclick={corpseFrom} text="make corpse" />
        <Button disabled={busy} onclick={exportPaths} text="download paths" />
      {:else}
        <Button disabled={busy} onclick={rerender} text="re-render thumb" />
      {/if}
      <Button color="red" disabled={busy} onclick={previewDelete} text="delete…" />
    </div>

    {#if pendingDelete}
      <div class="delete-preview">
        <h2>
          deletes {pendingDelete.section ? "1 section + " : ""}{pendingDelete.corpses.length}
          corpse{pendingDelete.corpses.length === 1 ? "" : "s"}{pendingDelete.section ? " it's in" : ""}.
          this can't be undone; hiding can.
        </h2>
        <div class="preview-grid">
          {#if pendingDelete.section}
            <img src={adminThumb("sections", pendingDelete.section)} alt={pendingDelete.section.title} />
          {/if}
          {#each pendingDelete.corpses as corpse (corpse.id)}
            <figure>
              <img src={adminThumb("corpses", corpse)} alt={corpse.title} />
              {#if corpse.hidden}<figcaption>already hidden</figcaption>{/if}
            </figure>
          {/each}
        </div>
        <div class="actions">
          <Button color="red" disabled={busy} onclick={confirmDelete} text="delete" />
          <Button onclick={() => (pendingDelete = null)} text="cancel" />
        </div>
      </div>
    {/if}

    {#if message}
      <p class="message" role="status">
        {message.text}
        {#if message.id}<CopyId id={message.id} />{message.after}{/if}
      </p>
    {/if}
  </div>
</Panel>

<style lang="scss">
  .layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;

    h1 {
      overflow-wrap: anywhere;
    }
  }

  img {
    width: 100%;
    height: auto;
    border: 2px solid var(--black);
    background: var(--white);
  }

  img.corpse {
    max-width: 360px;
  }

  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25rem 1rem;
    font-size: 0.875rem;
  }

  dt {
    opacity: 0.6;
  }

  dd {
    overflow-wrap: anywhere;
  }

  .link {
    text-decoration: underline;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    > :global(button) {
      flex: 1 1 auto;
    }
  }

  .delete-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 2px dashed var(--red);

    h2 {
      font-size: 0.875rem;
    }
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  figure figcaption {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .message {
    font-size: 0.875rem;
  }
</style>
