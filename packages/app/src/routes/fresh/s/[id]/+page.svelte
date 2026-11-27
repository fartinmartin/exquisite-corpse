<script lang="ts">
  import { page } from "$app/state";
  import { thumbUrl } from "#lib/thumbs.ts";
  import { tiltFor } from "#lib/corpse/folds.ts";
  import { LABELS } from "#lib/corpse/types.ts";
  import Actions from "../../ui/actions.svelte";
  import Artist from "../../ui/artist.svelte";
  import SectionPlayer from "../../ui/section-player.svelte";
  import { getSection, getSectionCreatures } from "../../../gallery/section/[id]/section.remote";

  const id = $derived(page.params.id ?? "");
  const [result, creatures] = $derived(await Promise.all([getSection(id), getSectionCreatures(id)]));
  const section = $derived(result.section);
</script>

<svelte:head>
  <title>exquisite corpse club ▪ {section.title} by {section.artist}</title>
</svelte:head>

<main class="section">
  <div class="head">
    <SectionPlayer {section} {creatures} />

    <div class="below">
      <h1>{section.title}</h1>
      <!-- one artist per third, so the name is in plain sight (creatures hide theirs on the back) -->
      <p class="byline">a {LABELS[section.type]} by <Artist name={section.artist} /></p>
      <Actions
        collection="sections"
        {id}
        likes={section.likes}
        drawings={[section.drawing]}
        filename={`${section.title}.png`}
        href={`/fresh/s/${section.id}`}
      />
    </div>
  </div>

  {#if result.moreBy.length}
    <section>
      <h2 class="mono">more by <Artist name={section.artist} /></h2>
      <ul class="sections">
        {#each result.moreBy as other (other.id)}
          <li style:--tilt="{tiltFor(other.id, 2)}deg">
            <a href={`/fresh/s/${other.id}`}>
              <img src={thumbUrl("sections", other)} alt={other.title} loading="lazy" decoding="async" />
              <span class="mono">{other.title} · {LABELS[other.type]}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>

<style>
  .section {
    max-width: 1000px;
    margin: 1vh auto 0;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }

  .head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .below {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }

  h1 {
    font-weight: 600;
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    letter-spacing: -0.035em;
    line-height: 1.05;
  }

  .byline {
    color: var(--ink-soft);
  }

  .byline :global(.artist) {
    color: var(--ink);
  }

  .below :global(.actions) {
    margin-top: 6px;
    justify-content: center;
  }

  h2 {
    font-weight: 400;
    margin-bottom: 20px;
  }

  ul {
    list-style: none;
    display: grid;
    gap: 40px 32px;
  }

  .sections {
    grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  }

  li a {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-decoration: none;
  }

  li img {
    width: 100%;
    aspect-ratio: 3 / 1;
    background: #fff;
    border: 2px solid var(--light-blue);
    box-shadow: 3px 3px 0 0 var(--blue);
    rotate: var(--tilt);
    transition:
      rotate 200ms cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @media (hover: hover) {
    li a:hover img {
      rotate: 0deg;
      box-shadow: 6px 6px 0 0 var(--orange);
      border-color: var(--yellow);
    }
  }
</style>
