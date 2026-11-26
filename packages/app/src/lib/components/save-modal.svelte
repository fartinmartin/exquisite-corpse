<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import Button from "./button.svelte";
  import CanvasPanel from "./canvas-panel.svelte";
  import Input from "./input.svelte";
  import Loading from "./loading.svelte";
  import Panel from "./panel.svelte";

  type Props = {
      drawing: DrawingData;
    defaultTitle: string;
    defaultArtist: string;
    onsave: (input: { title: string; artist: string }) => Promise<void>;
    onclose: () => void;
  };

  let { drawing, defaultTitle, defaultArtist, onsave, onclose }: Props = $props();

  // svelte-ignore state_referenced_locally
  let title = $state(defaultTitle);
  // svelte-ignore state_referenced_locally
  let artist = $state(defaultArtist);
  let status = $state<"idle" | "saving" | "success" | "error">("idle");

  const busy = $derived(status === "saving" || status === "success");

  async function save() {
    if (busy) return;
    status = "saving";
    try {
      await onsave({ title, artist });
      status = "success";
    } catch {
      status = "error";
    }
  }

  function backdrop(event: MouseEvent) {
    if (status !== "idle") return;
    const target = event.target as HTMLElement;
    if (target.classList.contains("save-modal")) onclose();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === "Escape" && status === "idle") onclose();
  }

  $effect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });
</script>

<div class="fs-modal save-modal" onclick={backdrop} role="presentation">
  <div class="wrap">
    <CanvasPanel
      id="save-preview"
      mode="display"
      {drawing}
      duration={1}
      meta={{ title: title || defaultTitle, artist: artist || defaultArtist }}
    />

    <Panel class="save-form">
      <form onsubmit={(event) => { event.preventDefault(); save(); }}>
        <Input
          id="title"
          label="your section's title:"
          placeholder={defaultTitle}
          maxlength={40}
          bind:value={title}
          temp={title === defaultTitle}
          onfocus={() => title === defaultTitle && (title = "")}
        />
        <div class="mt">
          <Input
            id="artist"
            label="your *ahem* artist name:"
            note="(@s will link to your instagram)"
            placeholder={defaultArtist}
            maxlength={30}
            bind:value={artist}
            temp={artist === defaultArtist}
            onfocus={() => artist === defaultArtist && (artist = "")}
          />
        </div>

        <div style="margin-top: 2rem;">
          <Button type="submit" color="yellow" text="save & show me our masterpiece!" />
        </div>
        <div class="mt">
          <Button
            style="color: var(--orange);"
            text="wait, i'm not done drawing"
            onclick={onclose}
          />
        </div>
      </form>

      {#if status !== "idle"}
        <div class="loadal">
          {#if status === "saving"}
            <Loading subtext="generating your masterpiece" color="yellow" />
          {:else if status === "success"}
            <Loading text="you did it!" subtext="your drawing was saved" color="green" />
          {:else if status === "error"}
            <button class="error-reset" onclick={onclose} aria-label="close">
              <Loading text="oop!" subtext="there was an error.. try again?" color="red" />
            </button>
          {/if}
        </div>
      {/if}
    </Panel>
  </div>
</div>

<style lang="scss">
  .save-modal {
    z-index: 951 !important;

    @media screen and (max-width: 1040px) {
      z-index: 955;
    }
  }

  :global(.save-form) {
    position: relative;
    margin-top: 40px;

    :global(.content) {
      display: block;
    }
  }

  .loadal {
    position: absolute;
    top: -2px;
    left: -2px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    background: var(--white);
    z-index: 5;

    :global(.loading-wrap) {
      padding-top: initial !important;
      height: 100%;
      max-width: none;
      position: static;
    }

    :global(.panel) {
      max-width: none;
    }
  }

  .error-reset {
    width: 100%;
    height: 100%;
  }
</style>
