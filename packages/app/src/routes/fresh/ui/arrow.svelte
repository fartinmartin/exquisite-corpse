<script lang="ts">
  type Props = { back?: boolean };

  let { back = false }: Props = $props();
</script>

<!-- A drawn arrow; nudges along when its link or button is hovered (see .arrow in the layout). -->
<svg class="arrow" data-back={back || undefined} viewBox="0 0 26 14" aria-hidden="true">
  <path d="M2 7.5 C 8 6.2, 15 8.4, 22 6.8" />
  <path d="M16.5 2.2 C 19 4, 21 5.6, 23 7 C 20.6 8.2, 18.6 9.8, 16.8 12.2" />
</svg>
