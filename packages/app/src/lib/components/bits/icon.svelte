<script lang="ts">
  let {
    name,
    size,
    class: className,
  }: {
    /** Remixicon class name without the `ri-` prefix, e.g. `file-info-line` */
    name: string;
    size?: 'xxs' | 'xs' | 'sm' | '1x' | 'lg' | 'xl' | '2x' | '3x';
    class?: string;
  } = $props();
</script>

<i class={[`ri-${name}`, size && `ri-${size}`, 'icon', className]} aria-hidden="true"></i>

<style>
  .icon {
    line-height: inherit;
  }
</style>
