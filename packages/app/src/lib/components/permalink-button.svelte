<script lang="ts">
  import Icon from "./icon.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
  };

  let { collection, id }: Props = $props();

  let copied = $state(false);

  function url() {
    const type = collection === "corpses" ? "corpse" : "section";
    return `${location.origin}/gallery/${type}/${id}`;
  }

  async function copy() {
    const text = url();

    if (!navigator.clipboard) {
      fallback(text);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      flash();
    } catch {
      fallback(text);
    }
  }

  function fallback(text: string) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.opacity = "0";
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    flash();
  }

  function flash() {
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<button onclick={copy} aria-label={copied ? "link copied!" : "share link"}>
  <Icon tooltip={copied ? "link copied!" : "share link"} class="permalink">
    {#if copied}
      <img class="is-copied" src="/img/icons/copy.svg" alt="" />
    {:else}
      <img src="/img/icons/link.svg" alt="" />
    {/if}
  </Icon>
</button>

<style lang="scss">
  :global(.icon.permalink) {
    position: relative;
  }

  .is-copied {
    position: absolute;
    width: 100%;
  }
</style>
