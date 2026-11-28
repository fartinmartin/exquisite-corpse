<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import type { SectionType } from "@ecc/firestore";
  import type { DrawingData } from "@ecc/lexicons";
  import { backFor } from "#lib/corpse/backs.ts";
  import Fold from "#lib/corpse/fold.svelte";
  import { randomFold, type FoldPlan } from "#lib/corpse/folds.ts";
  import Peek from "#lib/corpse/peek.svelte";
  import { LABELS, TYPES, type Panels } from "#lib/corpse/types.ts";
  import { drawState, GUEST_HANDLE_COOKIE } from "#lib/draw/state.svelte.ts";
  import Surface from "#lib/draw/surface.svelte";
  import { getSiblings, randomTitle, saveDrawing, type Sibling } from "../../draw/draw.remote";
  import Arrow from "../ui/arrow.svelte";
  import { brushCursor } from "../ui/brush-cursor.ts";
  import Tools from "../ui/tools.svelte";
  import Swap from "../ui/swap.svelte";
  import { highlight } from "../ui/marks.ts";
  import { doodles as doodleState } from "../doodle-settings.svelte.ts";

  type Step = "pick" | "draw" | "sign" | "reveal";


  let step = $state<Step>("pick");
  let section = $state<SectionType | null>(null);
  let siblings = $state<Partial<Record<SectionType, Sibling>>>({});
  let loading = $state(false);
  let failed = $state<string | null>(null);

  let title = $state("");
  let artist = $state("");
  let rememberedArtist = $state("anonymous");
  let saving = $state(false);
  let corpseId = $state<string | null>(null);
  let finished = $state<{ panels: Panels; plan: FoldPlan } | null>(null);
  let sheet = $state<HTMLElement>();
  let liveWidth = $state(0);

  /** The cursor over the drawing previews the brush (canvas-paint draws on a 1080-wide canvas). */
  const cursor = $derived(
    brushCursor({ mode: drawState.mode, size: drawState.size, color: drawState.color, scale: liveWidth / 1080 })
  );

  /**
   * The reveal starts exactly where the drawing was: same width, your third in
   * the same spot, no tilt. Once unfolded it settles to fit the screen.
   */
  let from = $state<{ width: number; offset: number } | null>(null);
  let settled = $state(false);

  const dirty = $derived((step === "draw" || step === "sign") && !drawState.empty);

  $effect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${GUEST_HANDLE_COOKIE}=([^;]*)`));
    rememberedArtist = match ? decodeURIComponent(match[1]) : "anonymous";
    drawState.reset();
  });

  // Drawing mode: the doodles get out of the way, and return for the unfold.
  $effect(() => {
    doodleState.scattered = step === "draw" || step === "sign";
    return () => (doodleState.scattered = false);
  });

  beforeNavigate(({ cancel, type }) => {
    if (!dirty) return;
    // For "leave" (reload, tab close, external link) cancel() asks the browser
    // to show its own "leave site?" prompt.
    if (type === "leave") return cancel();
    if (!confirm("leave without saving?")) cancel();
  });

  async function pick(type: SectionType) {
    section = type;
    step = "draw";
    loading = true;
    failed = null;
    drawState.reset();
    try {
      const [panels, words] = await Promise.all([getSiblings(type), randomTitle()]);
      siblings = panels;
      title = words;
    } catch (cause) {
      failed = cause instanceof Error ? cause.message : "couldn't fetch the other thirds";
    } finally {
      loading = false;
    }
  }

  function restart() {
    if (dirty && !confirm("start over?")) return;
    step = "pick";
    section = null;
    siblings = {};
    corpseId = null;
    finished = null;
    from = null;
    drawState.reset();
  }

  async function save(event: SubmitEvent) {
    event.preventDefault();
    const paint = drawState.paint;
    if (!paint || !section || saving) return;
    saving = true;
    failed = null;
    try {
      const drawing = paint.save() as unknown as DrawingData;
      // Thumbnails are rendered on the server from the saved drawings (/thumbs).
      const result = await saveDrawing({
        type: section,
        title: title.trim() || "untitled",
        artist: artist.trim(),
        drawing,
        siblings: { top: siblings.top?.id, mid: siblings.mid?.id, bot: siblings.bot?.id },
      });
      corpseId = result.corpseId;
      const live = sheet?.querySelector(".live");
      if (sheet && live) {
        const outer = sheet.getBoundingClientRect();
        const inner = live.getBoundingClientRect();
        // the base slot sits index/3 of the way down the square
        from = { width: outer.width, offset: inner.top - outer.top - (TYPES.indexOf(section) * outer.width) / 3 };
      }
      settled = false;
      // Your third stays on the desk; the others were folded away behind it.
      finished = {
        panels: {
          ...siblings,
          [section]: { id: result.sectionId, title, artist: artist || rememberedArtist, drawing },
        },
        // your own third face-up on the desk is fine: you've seen it
        plan: { ...randomFold({ base: section, side: -1, face: "any" }), tilt: 0 },
      };
      step = "reveal";
    } catch (cause) {
      failed = cause instanceof Error ? cause.message : "that didn't save — try again?";
    } finally {
      saving = false;
    }
  }

  function keydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as HTMLElement)?.tagName === "INPUT") return;

    if (step === "pick") {
      const type = ({ "1": "top", "2": "mid", "3": "bot" } as const)[event.key as "1" | "2" | "3"];
      if (type) void pick(type);
      return;
    }
  }

  /** Neighbours: which edge faces the live third, and whether a sliver shows. */
  function fold(type: SectionType) {
    const here = TYPES.indexOf(section!);
    const there = TYPES.indexOf(type);
    return { edge: there < here ? ("bottom" as const) : ("top" as const), sliver: Math.abs(there - here) === 1 };
  }
</script>

<svelte:head>
  <title>exquisite corpse club ▪ draw</title>
</svelte:head>

<svelte:window onkeydown={keydown} />

<!-- only the pick step is centred: the reveal unfolds in place from where you drew, so later steps keep their top -->
<main class="draw" class:middle={step === "pick"}>
  {#if step === "pick" || !section}
    <h1>pick a third</h1>
    <div class="paper sheet pick">
      {#each TYPES as type (type)}
        <button onclick={() => pick(type)}>{LABELS[type]}</button>
      {/each}
    </div>
    <p class="mono">someone else has drawn the other two</p>
  {:else if step === "reveal" && finished}
    <div
      class="unfolded"
      data-settled={settled || undefined}
      style:width={from && !settled ? `${from.width}px` : undefined}
      style:margin-top={from && !settled ? `${from.offset}px` : undefined}
    >
      <Fold
        panels={finished.panels}
        plan={finished.plan}
        back={backFor(corpseId ?? "")}
        delay={150}
        onunfolded={() => {
          settled = true;
          if (finished) finished.plan.tilt = Number(((Math.random() * 2 - 1) * 3).toFixed(2));
        }}
      />
    </div>
  {:else}
    <div class="paper sheet" data-step={step} bind:this={sheet}>
      {#each TYPES as type (type)}
        {#if type === section}
          <div class="live" bind:clientWidth={liveWidth} style:--brush={cursor}><Surface locked={step !== "draw" || loading} /></div>
        {:else}
          {@const { edge, sliver } = fold(type)}
          <Peek {type} drawing={siblings[type]?.drawing} {edge} {sliver} open={step === "reveal"}>
            {loading ? "…" : siblings[type] ? `someone's ${LABELS[type]}` : `no ${LABELS[type]} yet`}
          </Peek>
        {/if}
      {/each}
    </div>

    {#if failed}<p class="mono error">{failed}</p>{/if}

    {#if step === "draw"}
      <Tools enabled={!loading} ondone={() => (step = "sign")} />

      <div class="below">
        <button class="squiggle mono-link" onclick={restart}><Arrow back />another third</button>
        <button class="hl done" style={highlight("done")} disabled={drawState.empty} onclick={() => (step = "sign")}>done <Arrow /></button>
      </div>
    {:else if step === "sign"}
      <form class="sentence" onsubmit={save}>
        this {LABELS[section]} is called
        <input bind:value={title} maxlength="40" aria-label="title" size={Math.max(8, title.length)} />
        by
        <input
          bind:value={artist}
          maxlength="30"
          aria-label="artist name"
          placeholder={rememberedArtist}
          size={Math.max(8, (artist || rememberedArtist).length)}
        />
        <button class="hl" style={highlight("unfold")} type="submit" disabled={saving}><Swap labels={["unfold", "unfolding…"]} active={saving ? 1 : 0} /> <Arrow /></button>
      </form>
      <button class="squiggle mono-link" onclick={() => (step = "draw")}><Arrow back />keep drawing</button>
    {/if}
  {/if}

  {#if step === "reveal" && corpseId}
    <div class="below">
      <button class="squiggle mono-link" onclick={restart}>draw another</button>
      <a class="hl done" href={`/fresh/c/${corpseId}`} style={highlight("meet it")}>meet it <Arrow /></a>
    </div>
  {/if}
</main>

<style>
  .draw {
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  h1 {
    font-weight: 600;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    letter-spacing: -0.03em;
  }

  .sheet {
    position: relative;
    width: 100%;
    max-width: 760px;
    transition: max-width 700ms cubic-bezier(0.77, 0, 0.175, 1);
  }

  /* unfolded, the sheet is square: size it so the whole creature fits on screen */
  .unfolded {
    width: min(100%, 560px, calc(100vh - 280px));
    margin: 12px 0 28px; /* room for the tilt */
  }

  .unfolded[data-settled] {
    transition:
      width 700ms cubic-bezier(0.77, 0, 0.175, 1),
      margin-top 700ms cubic-bezier(0.77, 0, 0.175, 1);
  }

  .pick {
    display: flex;
    flex-direction: column;
    max-width: 520px;
  }

  .pick button {
    aspect-ratio: 3 / 1;
    text-align: center;
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 500;
    color: var(--ink-soft);
    transition: background-color 150ms, color 150ms;
  }

  .pick button + button {
    border-top: 1px dashed var(--light-blue);
  }

  .pick button:hover,
  .pick button:focus-visible {
    color: var(--ink);
    background: rgba(252, 218, 0, 0.25);
    outline: none;
  }

  /* over the drawing, the cursor is the brush */
  .live :global(canvas) {
    cursor: var(--brush);
  }

  .live {
    position: relative;
    z-index: 1;
    box-shadow: 0 0 0 2px var(--yellow);
  }

  .sheet[data-step="reveal"] .live {
    box-shadow: none;
    transition: box-shadow 400ms;
  }














  .below {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .done {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .mono-link {
    display: inline-flex;
    align-items: center;
    font-family: var(--mono);
    font-size: 0.8125rem;
  }


  /* ---- signing is a sentence ---- */
  .sentence {
    font-size: clamp(1.125rem, 2.6vw, 1.5rem);
    line-height: 2;
    text-align: center;
    max-width: 640px;
  }

  .sentence input {
    font: inherit;
    font-weight: 600;
    color: var(--ink);
    text-align: center;
    border-bottom: 2px solid var(--ink);
    padding: 0 4px;
    margin: 0 4px;
    outline: none;
    max-width: 14ch;
  }

  .sentence input:focus {
    border-bottom-color: var(--blue);
    background: rgba(252, 218, 0, 0.25);
  }

  .sentence input::placeholder {
    color: var(--ink-soft);
    font-weight: 400;
  }

  .sentence button {
    margin-left: 10px;
    vertical-align: middle;
    font-size: 1rem;
  }

  .error {
    color: var(--red);
  }
</style>
