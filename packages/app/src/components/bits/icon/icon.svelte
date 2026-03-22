<script lang="ts">
  import spritePath from './remixicon.symbol.svg?url';

  let {
    name,
    size = 16,
    class: className,
  }: {
    /** Remixicon icon name without the `ri-` prefix, e.g. `file-info-line` */
    name: string;
    /** Size in pixels. Defaults to 16. */
    size?: number;
    class?: string;
  } = $props();
</script>

<svg
  class={['icon', className]}
  width={size}
  height={size}
  aria-hidden="true"
>
  <use href="{spritePath}#ri-{name}"></use>
</svg>

<style>
  .icon {
    display: inline-block;
    fill: currentColor;
    flex-shrink: 0;
  }
</style>
