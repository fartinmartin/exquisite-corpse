<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import Button from "#lib/components/button.svelte";
  import Panel from "#lib/components/panel.svelte";
  import type { SiteMode } from "#lib/site-mode.ts";
  import type { Collection } from "@ecc/firestore";
  import Activity from "./activity.svelte";
  import Browser from "./browser.svelte";
  import Integrity from "./integrity.svelte";
  import { resetLikes, setSiteMode, siteMode } from "./admin.remote";

  const MODES: { mode: SiteMode; color: "green" | "yellow" | "red" }[] = [
    { mode: "open", color: "green" },
    { mode: "read-only", color: "yellow" },
    { mode: "closed", color: "red" },
  ];

  const site = $derived(await siteMode());
  let message = $state<string | null>(null);
  let browser = $state<ReturnType<typeof Browser>>();

  function reveal(collection: Collection, id: string) {
    browser?.reveal(collection, id);
  }

  async function run(action: () => Promise<string>) {
    message = null;
    try {
      message = await action();
    } catch (cause) {
      message = cause instanceof Error ? cause.message : "request failed";
    }
  }

  function changeMode(mode: SiteMode) {
    if (mode !== "open" && !confirm(`set the site to ${mode}?`)) return;
    return run(async () => {
      await setSiteMode(mode);
      return `site is now ${mode}`;
    });
  }

  function reset() {
    if (!confirm("reset likes on every corpse and section?")) return;
    return run(async () => {
      const { updated } = await resetLikes();
      return `likes reset on ${updated} drawings`;
    });
  }
</script>

<Seo title="admin" noindex />

<div class="admin">
  <Panel class="admin-index">
    <div class="top">
      <div>
        <h1>site mode: {site.mode}</h1>
        <p class="note">
          {#if Date.parse(site.at) === 0}
            default (never changed)
          {:else}
            {site.reason === "budget" ? "set by the budget hook" : "set manually"} ▪ {new Date(site.at).toLocaleString()}
          {/if}
        </p>
      </div>
      <div class="modes">
        {#each MODES as option (option.mode)}
          <Button color={option.color} onclick={() => changeMode(option.mode)} text={option.mode} />
        {/each}
      </div>
    </div>
  </Panel>

  <Browser bind:this={browser} />

  <Activity onreveal={reveal} />

  <Integrity onreveal={reveal} />

  <details class="tools">
    <summary>tools</summary>
    <Panel class="admin-index">
      <div class="modes">
        <Button color="red" onclick={reset} text="reset all likes" />
        <form method="POST" action="/admin/logout">
          <Button type="submit" text="sign out" />
        </form>
      </div>
    </Panel>
  </details>

  {#if message}
    <Panel class="admin-index"><p role="status">{message}</p></Panel>
  {/if}
</div>

<style lang="scss">
  .admin {
    max-width: 1200px;
    margin: 0 auto;
    // Clears the site nav, which floats over the page corners.
    padding: calc(60px + 40px / 3 * 2) calc(40px / 3) calc(40px / 3);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .admin :global(.panel) {
    max-width: none;
  }

  .top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .note {
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .tools summary {
    cursor: pointer;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
</style>
