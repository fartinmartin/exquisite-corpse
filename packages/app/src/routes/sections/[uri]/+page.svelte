<script lang="ts">
  import { page } from "$app/state";

  const uri = $derived(decodeURIComponent(page.params.uri ?? ""));
</script>

<main>
  <h1>Section submitted!</h1>
  <p><code>{uri}</code></p>
  <a href="/draw">Draw another</a>
</main>
