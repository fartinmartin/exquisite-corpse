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
  import { hand } from "../ui/hand.svelte.ts";
  import { learned } from "../ui/learned.svelte.ts";
  import { MediaQuery } from "svelte/reactivity";
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

  /*
   * Centring. The pick step centres like any one-sheet page (.middle). The
   * later steps can't: the reveal unfolds in place from where you drew, so
   * the sheet's top must not move between draw, sign and reveal. So the draw
   * step is centred by measuring it once, and sign and reveal keep that top.
   */
  let main = $state<HTMLElement>();
  let stageTop = $state(0);
  let innerHeight = $state(800);

  $effect(() => {
    if (step !== "draw" || !main) return;
    const element = main;
    const place = () => {
      const contentTop = (element.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY;
      // 64px: the content's bottom padding, matching .middle pages
      stageTop = Math.max(0, Math.round((innerHeight - contentTop - 64 - element.offsetHeight) / 2));
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(element);
    return () => observer.disconnect();
  });

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

  // Phones draw best on their side (the 3:1 strip triples in size). In
  // portrait, suggest it once; seeing landscape while drawing counts as learned.
  const phonePortrait = new MediaQuery("(pointer: coarse) and (max-width: 719px) and (orientation: portrait)");
  const phoneLandscape = new MediaQuery("(pointer: coarse) and (max-height: 500px) and (orientation: landscape)");
  $effect(() => {
    if (step === "draw" && phoneLandscape.current) learned.learn("sideways");
  });

  // While drawing, the page can't scroll or bounce (no pull-to-refresh wiping a drawing).
  $effect(() => {
    if (step !== "draw") return;
    const html = document.documentElement;
    const previous = html.style.overscrollBehavior;
    html.style.overscrollBehavior = "none";
    return () => (html.style.overscrollBehavior = previous);
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

<svelte:window onkeydown={keydown} bind:innerHeight />

<main
  class="draw"
  data-step={step}
  data-hand={hand.side}
  class:middle={step === "pick"}
  bind:this={main}
  style:margin-top={step === "pick" ? undefined : `${stageTop}px`}
>
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
      {#if phonePortrait.current && learned.needs("sideways")}
        <p class="mono hint sideways">↻ turn your phone sideways for more room</p>
      {/if}
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
    width: min(100%, 560px, calc(100svh - 280px));
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

  /* touch tablets: let the sheet use the width (the canvas keeps its 3:1) */
  @media (pointer: coarse) and (min-width: 720px) {
    .draw,
    .sheet {
      max-width: min(1000px, 100%);
    }
  }

  /* phones: "done" lives in the dock (ui/tools.svelte), which is fixed to the
     bottom, so leave room for it */
  @media (pointer: coarse) and (max-width: 719px) {
    .draw[data-step="draw"] .below .done {
      display: none;
    }

    .draw[data-step="draw"] {
      padding-bottom: 88px;
    }
  }

  /* phones on their side: no header while drawing, and room for the rail */
  @media (pointer: coarse) and (max-height: 500px) and (orientation: landscape) {
    :global(html:has(.draw[data-step="draw"]) .fresh > header) {
      display: none;
    }

    .draw[data-step="draw"] {
      max-width: none;
      padding-block: 8px;
      padding-inline-end: 72px;
    }

    .draw[data-step="draw"][data-hand="left"] {
      padding-inline: 72px 0;
    }

    .draw[data-step="draw"] .sheet {
      /* as wide as fits under the screen's height (3:1 third + its two slivers) */
      max-width: min(100%, calc((100svh - 110px) * 3));
    }

    .draw[data-step="draw"] .below .done {
      display: none;
    }
  }

  .sideways {
    margin-top: -8px;
  }
</style>
