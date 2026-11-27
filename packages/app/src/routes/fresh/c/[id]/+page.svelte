<script lang="ts">
  import { page } from "$app/state";
  import CreatureView from "../../ui/creature-view.svelte";
  import { getCorpse } from "../../../gallery/corpse/[id]/corpse.remote";

  const id = $derived(page.params.id ?? "");
  const corpse = $derived(await getCorpse(id));
</script>

<svelte:head>
  <title>exquisite corpse club ▪ {corpse.title}</title>
</svelte:head>

<CreatureView {corpse} />
