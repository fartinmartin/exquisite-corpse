<script lang="ts">
  import { listSections, listCorpses } from "./gallery.remote";
  import Tabs from '$components/bits/tabs/tabs.svelte';
  import TabsList from '$components/bits/tabs/tabs-list.svelte';
  import TabsTrigger from '$components/bits/tabs/tabs-trigger.svelte';
  import TabsPanel from '$components/bits/tabs/tabs-panel.svelte';
  import Card from '$components/bits/card.svelte';
  import Badge from '$components/bits/badge.svelte';
  import Button from '$components/bits/button.svelte';
  import type { SectionType } from "@ecc/lexicons";

  type Filter = SectionType | "all";
  const FILTERS: Filter[] = ["all", "top", "mid", "bot"];

  let filter = $state<Filter>("all");
</script>

<main class="canvas">
  <Tabs value="drawings" variant="pill">
    <header>
      <TabsList>
        <TabsTrigger value="drawings">drawings</TabsTrigger>
        <TabsTrigger value="sections">sections</TabsTrigger>
      </TabsList>
    </header>

    <TabsPanel value="drawings">
      <svelte:boundary>
        {#await listCorpses({})}
          <p class="hint">loading...</p>
        {:then corpses}
          {#if corpses.length === 0}
            <p class="hint">no drawings yet.</p>
          {:else}
            <ul role="list" class="grid-auto gap-sm" style="--grid-item-min: 200px">
              {#each corpses as corpse (corpse.id)}
                <li>
                  <Card>
                    <div class="card-media corpse-panels">
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
                    <div class="card-footer repel">
                      <span class="title">{corpse.title}</span>
                      <span class="likes">♥ {corpse.likeCount}</span>
                    </div>
                  </Card>
                </li>
              {/each}
            </ul>
          {/if}
        {/await}
      </svelte:boundary>
    </TabsPanel>

    <TabsPanel value="sections">
      <div class="cluster gap-2xs filter-bar">
        {#each FILTERS as f}
          <Button
            appearance={filter === f ? undefined : "ghost"}
            size="sm"
            onclick={() => (filter = f)}
          >{f}</Button>
        {/each}
      </div>

      <svelte:boundary>
        {#await listSections({ section: filter === "all" ? undefined : filter })}
          <p class="hint">loading...</p>
        {:then sections}
          {#if sections.length === 0}
            <p class="hint">no sections yet.</p>
          {:else}
            <ul role="list" class="grid-auto gap-sm" style="--grid-item-min: 200px">
              {#each sections as section (section.id)}
                <li>
                  <Card>
                    <div class="card-media">
                      {#if section.imageUrl}
                        <img src={section.imageUrl} alt="{section.section} section" />
                      {:else}
                        <div class="placeholder"></div>
                      {/if}
                    </div>
                    <div class="card-footer repel">
                      <Badge variant="neutral" appearance="soft">{section.section}</Badge>
                      <span class="likes">♥ {section.likeCount}</span>
                    </div>
                  </Card>
                </li>
              {/each}
            </ul>
          {/if}
        {/await}
      </svelte:boundary>
    </TabsPanel>
  </Tabs>
</main>

<style>
  main {
    padding-block: var(--space-xl);
    padding-inline: var(--space-md);
  }

  header {
    margin-block-end: var(--space-lg);
  }

  .filter-bar {
    margin-block-end: var(--space-md);
  }

  .corpse-panels {
    display: flex;
    flex-direction: column;
  }

  .panel {
    border-bottom: 1px solid var(--color-surface-border);
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
    background: var(--color-surface-lowered);
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .likes {
    color: var(--color-text-quiet);
    flex-shrink: 0;
  }

  .hint {
    color: var(--color-text-quieter);
    text-align: center;
    padding-block: var(--space-2xl);
  }
</style>
