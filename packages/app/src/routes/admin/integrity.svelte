<script lang="ts">
  import type { Collection } from "@ecc/firestore";
  import Button from "#lib/components/button.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { integrityReport, repairReferences } from "./admin.remote";
  import CopyId from "./copy-id.svelte";

  type Props = {
    onreveal: (collection: Collection, id: string) => void;
  };

  let { onreveal }: Props = $props();

  // Loaded only when asked for: it reads every document's summary.
  let requested = $state(false);
  let busy = $state(false);
  let message = $state<string | null>(null);

  async function repair() {
    busy = true;
    message = null;
    try {
      const { repaired } = await repairReferences();
      message = `repaired ${repaired} section${repaired === 1 ? "" : "s"}`;
    } catch (cause) {
      message = cause instanceof Error ? cause.message : "repair failed";
    } finally {
      busy = false;
    }
  }
</script>

<Panel class="admin-index">
  <div class="integrity">
    <h1>data check</h1>
    {#if !requested}
      <p class="note">checks that corpses and sections point at each other correctly. read-only until you repair.</p>
      <Button onclick={() => (requested = true)} text="run check" />
    {:else}
      {@const report = await integrityReport()}
      <p class="note">
        {report.sections} sections ▪ {report.corpses} corpses ▪ checked {new Date(report.checkedAt).toLocaleTimeString()}
        <button class="link" onclick={() => integrityReport().refresh()}>re-run</button>
      </p>

      <h2>section → corpse references: {report.featuredIn.length} wrong</h2>
      {#if report.featuredIn.length}
        <p class="note">sections listing corpses that are gone or don't use them (or missing ones that do). safe to fix: it only rewrites the lists.</p>
        <ul>
          {#each report.featuredIn as item (item.sectionId)}
            <li>
              <CopyId id={item.sectionId} onopen={() => onreveal("sections", item.sectionId)} />
              {#if item.extra.length}
                <!-- keyed by index: a bad list can name the same corpse twice -->
                <small>extra: {#each item.extra as id, index (index)}<CopyId {id} />{/each}</small>
              {/if}
              {#if item.missing.length}
                <small>missing: {#each item.missing as id (id)}<CopyId {id} />{/each}</small>
              {/if}
            </li>
          {/each}
        </ul>
        <Button disabled={busy} onclick={repair} text="repair references" />
      {/if}

      <h2>broken corpse panels: {report.brokenPanels.length}</h2>
      {#if report.brokenPanels.length}
        <p class="note">corpses whose panel points at a missing or wrong-type section. open one to hide or delete it.</p>
        <ul>
          {#each report.brokenPanels as item (item.corpseId + item.type)}
            <li>
              <CopyId id={item.corpseId} onopen={() => onreveal("corpses", item.corpseId)} />
              <small>
                {item.type} →
                {#if item.sectionId}<CopyId id={item.sectionId} />{/if}
                ({item.problem})
              </small>
            </li>
          {/each}
        </ul>
      {/if}

      <h2>sections in no corpse: {report.unused.length}</h2>
      {#if report.unused.length}
        <p class="note">not an error (left behind when a corpse is deleted). "make corpse" gives them a new one.</p>
        <ul>
          {#each report.unused as id (id)}
            <li><CopyId {id} onopen={() => onreveal("sections", id)} /></li>
          {/each}
        </ul>
      {/if}

      {#if message}<p role="status">{message}</p>{/if}
    {/if}
  </div>
</Panel>

<style lang="scss">
  .integrity {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  h2 {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .note,
  small {
    font-size: 0.8125rem;
    opacity: 0.7;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    max-height: 200px;
    overflow-y: auto;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.5rem;
    overflow-wrap: anywhere;
  }

  li small {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.5rem;
  }

  .link {
    text-decoration: underline;
  }
</style>
