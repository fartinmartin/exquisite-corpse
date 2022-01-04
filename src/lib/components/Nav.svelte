<script>
  import Auth from "./Auth.svelte";
</script>

<nav>
  <a href="/">🏠 home</a>
  <a href="/gallery">🖼 gallery</a>
  <Auth />
</nav>

<style>
  nav *:not(:last-child) {
    margin-right: 1rem;
  }
</style>
