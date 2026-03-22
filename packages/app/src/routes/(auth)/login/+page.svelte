<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types.js";

  let { form }: { form: ActionData } = $props();
</script>

<main>
  <h1>Sign in</h1>
  <form method="POST" use:enhance>
    <label>
      Bluesky handle or DID
      <input name="handle" type="text" placeholder="you.bsky.social" required />
    </label>
    {#if form?.error}
      <p>{form.error}</p>
    {/if}
    <button type="submit">Continue</button>
  </form>
</main>
