<script lang="ts">
  import type { Collection } from "@ecc/firestore";
  import Panel from "#lib/components/panel.svelte";
  import { recentActions, undoAction } from "./admin.remote";

  type Props = {
    /** Opens an item in the browser. */
    onreveal: (collection: Collection, id: string) => void;
  };

  let { onreveal }: Props = $props();

  const LABELS: Record<string, string> = {
    hide: "hid",
    unhide: "unhid",
    delete: "deleted",
    "make-corpse": "made corpse",
    "rerender-thumb": "re-rendered thumb",
    "site-mode": "site mode →",
    "reset-likes": "reset all likes",
    "repair-refs": "repaired references",
  };

  const entries = $derived(await recentActions());
  let busy = $state<string | null>(null);
  let message = $state<string | null>(null);

  async function undo(id: string) {
    busy = id;
    message = null;
    try {
      await undoAction(id);
    } catch (cause) {
      message = cause instanceof Error ? cause.message : "undo failed";
    } finally {
      busy = null;
    }
  }
</script>

<Panel class="admin-index">
  <div class="activity">
    <h1>recent activity</h1>
    {#if message}<p role="status">{message}</p>{/if}
    <ol>
      {#each entries as entry (entry.id)}
        <li class:undone={entry.undoneBy}>
          <time datetime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
          <span>
            {entry.undoes ? "undo: " : ""}{LABELS[entry.action] ?? entry.action}
            {#if entry.detail}{entry.detail}{/if}
            {#each entry.ids as id (id)}
              {#if entry.collection && entry.action !== "delete"}
                <button class="link" onclick={() => onreveal(entry.collection!, id)}>{id}</button>
              {:else}
                <code>{id}</code>
              {/if}
            {/each}
            {#if entry.cascaded?.length}
              <small>(+{entry.cascaded.length} corpse{entry.cascaded.length === 1 ? "" : "s"})</small>
            {/if}
            {#if entry.undoneBy}<small>undone</small>{/if}
          </span>
          {#if entry.undoable}
            <button class="chip" disabled={busy !== null} onclick={() => undo(entry.id)}>
              {busy === entry.id ? "…" : "undo"}
            </button>
          {/if}
        </li>
      {:else}
        <li>nothing yet</li>
      {/each}
    </ol>
  </div>
</Panel>

<style lang="scss">
  .activity {
    width: 100%;
  }

  ol {
    list-style: none;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-size: 0.875rem;
    max-height: 320px;
    overflow-y: auto;
  }

  li {
    display: grid;
    grid-template-columns: 11rem 1fr auto;
    gap: 0.75rem;
    align-items: baseline;

    &.undone span {
      opacity: 0.5;
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr auto;

      time {
        grid-column: 1 / -1;
      }
    }
  }

  time,
  small {
    opacity: 0.6;
  }

  span {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.375rem;
    overflow-wrap: anywhere;
  }

  .link {
    text-decoration: underline;
  }

  .chip {
    padding: 0 0.5rem;
    border: 2px solid var(--black);
  }
</style>
