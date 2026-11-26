<script lang="ts">
  import Icon from "./icon.svelte";

  type Props = {
    image: string;
    title: string;
    artist?: string;
  };

  let { image, title, artist }: Props = $props();

  function download() {
    const source = new Image();
    source.src = image;
    source.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      const ctx = canvas.getContext("2d")!;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);

      const fileName = artist
        ? `exquisite corpse club-${title} by ${artist}`
        : `exquisite corpse club-${title}`;

      const link = document.createElement("a");
      canvas.toBlob((blob) => {
        if (!blob) return;
        link.download = `${fileName}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };
  }
</script>

<button onclick={download} data-tooltip="download" aria-label="download">
  <Icon svg="icons/download" />
</button>
