<script>
  import { user } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(async () => {
    const response = await fetch("/sentencer");
    const data = await response.json();
    console.log(data);
  });
</script>

<h1>home</h1>

<pre>
  {JSON.stringify($user, undefined, 2)}
</pre>
