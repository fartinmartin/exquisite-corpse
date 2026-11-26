<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import { drawingsToPng } from "#lib/render.ts";
  import Icon from "./icon.svelte";

  type Props = {
    /** Panels to stack top to bottom: one for a section, three for a corpse. */
    drawings: DrawingData[];
    title: string;
    artist?: string;
  };

  let { drawings, title, artist }: Props = $props();

  // Rendered from the drawings on click, so pages don't ship a full-size image.
  async function download() {
    const blob = await drawingsToPng(drawings);
    if (!blob) return;

    const fileName = artist
      ? `exquisite corpse club-${title} by ${artist}`
      : `exquisite corpse club-${title}`;

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<button onclick={download} data-tooltip="download" aria-label="download">
  <Icon svg="icons/download" />
</button>
