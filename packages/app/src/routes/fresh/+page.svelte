<script lang="ts">
  import { page } from "$app/state";
  import CreatureView from "./ui/creature-view.svelte";
  import { getCorpse } from "../gallery/corpse/[id]/corpse.remote";
  import { randomCorpse } from "../home.remote";

  // Home: a random creature, in the same view as its own page. A reload deals
  // a new one; coming back after "another" shows the one you left (see CreatureView).
  const pinned = $derived(page.state.pinned);
  const corpse = $derived(pinned ? await getCorpse(pinned) : await randomCorpse());
</script>

<svelte:head>
  <title>exquisite corpse club</title>
</svelte:head>

<CreatureView {corpse} />
