<script lang="ts">
  import { listSections, listCorpses } from "./gallery.remote";
  import type { SectionType } from "@ecc/lexicons";

  type Mode = "drawings" | "sections";
  type Filter = SectionType | "all";

  let mode = $state<Mode>("drawings");
  let filter = $state<Filter>("all");
</script>

<main>
  <header>
    <nav class="mode-tabs">
      <button data-active={mode === "drawings"} onclick={() => (mode = "drawings")}>
        Drawings
      </button>
      <button data-active={mode === "sections"} onclick={() => (mode = "sections")}>
        Sections
      </button>
    </nav>

    {#if mode === "sections"}
      <nav class="filter-tabs">
        {#each (["all", "top", "mid", "bot"] as Filter[]) as f}
          <button data-active={filter === f} onclick={() => (filter = f)}>
            {f}
          </button>
        {/each}
      </nav>
    {/if}
  </header>

  {#if mode === "drawings"}
    <svelte:boundary>
      {#await listCorpses({})}
        <p class="hint">Loading...</p>
      {:then corpses}
        {#if corpses.length === 0}
          <p class="hint">No drawings yet.</p>
        {:else}
          <ul class="grid">
            {#each corpses as corpse (corpse.id)}
              <li class="card corpse-card">
                <div class="corpse-panels">
                  <div class="panel">
                    {#if corpse.topImageUrl}
                      <img src={corpse.topImageUrl} alt="top section" />
                    {:else}
                      <div class="placeholder"></div>
                    {/if}
                  </div>
                  <div class="panel">
                    {#if corpse.midImageUrl}
                      <img src={corpse.midImageUrl} alt="mid section" />
                    {:else}
                      <div class="placeholder"></div>
                    {/if}
                  </div>
                  <div class="panel">
                    {#if corpse.botImageUrl}
                      <img src={corpse.botImageUrl} alt="bot section" />
                    {:else}
                      <div class="placeholder"></div>
                    {/if}
                  </div>
                </div>
                <div class="card-meta">
                  <span class="title">{corpse.title}</span>
                  <span class="likes">♥ {corpse.likeCount}</span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      {/await}
    </svelte:boundary>
  {:else}
    <svelte:boundary>
      {#await listSections({ section: filter === "all" ? undefined : filter })}
        <p class="hint">Loading...</p>
      {:then sections}
        {#if sections.length === 0}
          <p class="hint">No sections yet.</p>
        {:else}
          <ul class="grid">
            {#each sections as section (section.id)}
              <li class="card section-card">
                {#if section.imageUrl}
                  <img src={section.imageUrl} alt="{section.section} section" />
                {:else}
                  <div class="placeholder"></div>
                {/if}
                <div class="card-meta">
                  <span class="badge">{section.section}</span>
                  <span class="likes">♥ {section.likeCount}</span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      {/await}
    </svelte:boundary>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  nav {
    display: flex;
    gap: 0.25rem;
  }

  nav button {
    all: unset;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.9rem;
    cursor: pointer;
    background: #f0f0f0;
    transition: background 0.15s, color 0.15s;
  }

  nav button[data-active="true"] {
    background: #000;
    color: #fff;
  }

  .filter-tabs button {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .grid {
    all: unset;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    list-style: none;
  }

  .card {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
  }

  .corpse-panels {
    display: flex;
    flex-direction: column;
  }

  .panel {
    border-bottom: 1px solid #e0e0e0;
  }

  .panel:last-child {
    border-bottom: none;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  .placeholder {
    width: 100%;
    aspect-ratio: 2 / 1;
    background: #f5f5f5;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
  }

  .likes {
    color: #666;
    flex-shrink: 0;
  }

  .hint {
    color: #999;
    text-align: center;
    padding: 3rem 0;
  }
</style>
