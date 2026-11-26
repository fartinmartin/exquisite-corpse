<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import Button from "#lib/components/button.svelte";
  import Input from "#lib/components/input.svelte";
  import Panel from "#lib/components/panel.svelte";
  import {
    deleteCorpse,
    deleteSection,
    downloadPaths,
    makeCorpse,
    resetLikes,
    setSiteMode,
    siteMode,
    updateThumb,
  } from "./admin.remote";
  import type { SiteMode } from "#lib/site-mode.ts";

  const MODES: { mode: SiteMode; label: string; color: "green" | "yellow" | "red" }[] = [
    { mode: "open", label: "open", color: "green" },
    { mode: "read-only", label: "read-only", color: "yellow" },
    { mode: "closed", label: "closed", color: "red" },
  ];

  const site = $derived(await siteMode());

  function changeMode(mode: SiteMode) {
    if (mode !== "open" && !confirm(`set the site to ${mode}?`)) return;
    return run(async () => {
      await setSiteMode(mode);
      return `site is now ${mode}`;
    });
  }

  let corpseSectionId = $state("");
  let corpseId = $state("");
  let sectionId = $state("");
  let message = $state<string | null>(null);

  async function run(action: () => Promise<string>) {
    message = null;
    try {
      message = await action();
    } catch (cause) {
      message = cause instanceof Error ? cause.message : "request failed";
    }
  }

  function make() {
    if (!corpseSectionId) return;
    return run(async () => {
      const result = await makeCorpse(corpseSectionId);
      return `made corpse ${result.corpseId}`;
    });
  }

  function removeCorpse() {
    if (!corpseId || !confirm("you sure you want to delete corpse?")) return;
    return run(async () => {
      await deleteCorpse(corpseId);
      return `removed corpse ${corpseId}`;
    });
  }

  function thumb() {
    if (!corpseId) return;
    return run(async () => {
      await updateThumb(corpseId);
      return `updated thumb for ${corpseId}`;
    });
  }

  function removeSection() {
    if (!sectionId || !confirm("you sure you want to delete section?")) return;
    return run(async () => {
      await deleteSection(sectionId);
      return `removed section ${sectionId}`;
    });
  }

  function exportPaths() {
    if (!sectionId) return;
    return run(async () => {
      const { drawing } = await downloadPaths(sectionId);
      const data =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drawing));
      const link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", `${sectionId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return `downloaded ${sectionId}.json`;
    });
  }

  function reset() {
    if (!confirm("reset likes on every corpse and section?")) return;
    return run(async () => {
      await resetLikes();
      return "likes reset";
    });
  }
</script>

<Seo title="admin" noindex />

<div class="wrap">
  <h2>admin</h2>

  <Panel class="admin-index">
    <h1>site mode: {site.mode}</h1>
    <p class="note">
      {site.reason === "budget" ? "set by the budget hook" : "set manually"} ▪ {new Date(site.at).toLocaleString()}
    </p>
    <div class="input-wrap">
      {#each MODES as option (option.mode)}
        <Button
          color={option.color}
          onclick={() => changeMode(option.mode)}
          text={option.label}
        />
      {/each}
    </div>
  </Panel>

  <Panel class="admin-index">
    <h1>corpse</h1>
    <div class="input-wrap">
      <Input id="section-id-for-corpse" placeholder="enter sectionId" bind:value={corpseSectionId} />
      <Button onclick={make} text="make corpse" />
    </div>
    <div class="input-wrap">
      <Input id="corpse-id" placeholder="enter corpseId" bind:value={corpseId} />
      <Button color="red" onclick={removeCorpse} text="remove" />
      <Button onclick={thumb} text="update thumb" />
    </div>
  </Panel>

  <Panel class="admin-index">
    <h1>section</h1>
    <div class="input-wrap">
      <Input id="section-id" placeholder="enter sectionId" bind:value={sectionId} />
      <Button color="red" onclick={removeSection} text="remove section" />
      <Button onclick={exportPaths} text="download paths" />
    </div>
  </Panel>

  <Panel class="admin-index">
    <Button onclick={reset} text="reset all likes" />
  </Panel>

  <Panel class="admin-index">
    <form method="POST" action="/admin/logout">
      <Button type="submit" text="sign out" />
    </form>
  </Panel>

  {#if message}
    <Panel class="admin-index status">
      <p>{message}</p>
    </Panel>
  {/if}
</div>

<style lang="scss">
  h2 {
    font-size: 1rem;
    margin-bottom: calc(40px / 3);
  }

  form {
    width: 100%;
  }

  :global(.admin-index) {
    > :global(.content) {
      align-items: stretch;
      flex-direction: column;
    }

    &:not(:first-child) {
      margin-top: 2rem;
    }

    :global(.input-wrap) {
      display: flex;
      flex-wrap: wrap;

      :global(input) {
        flex: 1 0 50%;
      }

      :global(button) {
        flex: 1;
        margin-top: 1rem;
      }

      &:not(:first-child) {
        margin-top: 1rem;
      }
    }
  }

  .note {
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  :global(.status .content) {
    justify-content: flex-start;
  }
</style>
