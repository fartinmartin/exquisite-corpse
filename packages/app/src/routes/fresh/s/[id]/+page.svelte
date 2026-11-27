<script lang="ts">
  import { page } from "$app/state";
  import { learned } from "../../ui/learned.svelte.ts";
  import { thumbUrl } from "#lib/thumbs.ts";
  import { tiltFor } from "#lib/corpse/folds.ts";
  import { artistHref, LABELS } from "#lib/corpse/types.ts";
  import Actions from "../../ui/actions.svelte";
  import Printed from "../../ui/printed.svelte";
  import StripSheet from "../../ui/strip-sheet.svelte";
  import { getSection } from "../../../gallery/section/[id]/section.remote";

  const id = $derived(page.params.id ?? "");
  const result = $derived(await getSection(id));
  const section = $derived(result.section);

  let turned = $state(false);

  // Turning a sheet over once is enough to know how.
  $effect(() => {
    if (turned) learned.learn("turn");
  });

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }).toLowerCase();

</script>

<svelte:head>
  <title>exquisite corpse club ▪ {section.title} by {section.artist}</title>
</svelte:head>

<main class="section">
  <div class="head">
    <StripSheet drawing={section.drawing} label={`${section.title} by ${section.artist}`} tilt={tiltFor(section.id, 2)} bind:turned>
      {#snippet back()}
        <Printed no={section.id} title={section.title} date={date(section.date)}>
          <p>
            <span class="by">a {LABELS[section.type]} by</span>
            {#if artistHref(section.artist)}
              <a class="squiggle" href={artistHref(section.artist)} target="_blank" rel="noopener noreferrer" tabindex={turned ? 0 : -1}
                >{section.artist}</a
              >
            {:else}
              {section.artist}
            {/if}
          </p>
          <p class="by">part of {result.featuredIn.length} {result.featuredIn.length === 1 ? "creature" : "creatures"}</p>
        </Printed>
      {/snippet}
    </StripSheet>

    <div class="below">
      <h1>{section.title}</h1>
      <Actions
        collection="sections"
        {id}
        likes={section.likes}
        drawings={[section.drawing]}
        filename={`${section.title}.png`}
        href={`/fresh/s/${section.id}`}
      />
      {#if learned.needs("turn")}<p class="mono hint">tap the drawing to see who drew it</p>{/if}
    </div>
  </div>

  {#if result.featuredIn.length}
    <section>
      <h2 class="mono">lives in</h2>
      <ul class="creatures">
        {#each result.featuredIn as corpse (corpse.id)}
          <li style:--tilt="{tiltFor(corpse.id)}deg">
            <a href={`/fresh/c/${corpse.id}`}>
              <img src={thumbUrl("corpses", corpse)} alt={corpse.title} loading="lazy" />
              <span class="mono">{corpse.title}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if result.moreBy.length}
    <section>
      <h2 class="mono">more by {section.artist}</h2>
      <ul class="sections">
        {#each result.moreBy as other (other.id)}
          <li style:--tilt="{tiltFor(other.id, 2)}deg">
            <a href={`/fresh/s/${other.id}`}>
              <img src={thumbUrl("sections", other)} alt={other.title} loading="lazy" />
              <span class="mono">{other.title} · {LABELS[other.type]}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>

<style>
  .head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }

  .head > :global(.strip) {
    width: min(100%, 760px);
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

  .below :global(.actions) {
    margin-top: 6px;
    justify-content: center;
  }

  .section {
    max-width: 1000px;
    margin: 2vh auto 0;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }








  h2 {
    font-weight: 400;
  }




  h2 {
    margin-bottom: 20px;
  }

  ul {
    list-style: none;
    display: grid;
    gap: 40px 32px;
  }

  .creatures {
    grid-template-columns: repeat(auto-fill, minmax(min(130px, 40%), 1fr));
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
