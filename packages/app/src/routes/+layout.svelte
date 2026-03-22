<script lang="ts">
  import type { Snippet } from "svelte";
  import "$lib/components/styles/app.css"

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
