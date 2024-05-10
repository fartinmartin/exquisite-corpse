<script lang="ts">
	import "$styles/reset.css";
	import "$styles/base.css";
	import Nav from "$bits/nav.svelte";
</script>

<svelte:head>
	<title>exquisite corpse club</title>
</svelte:head>

<Nav />
<slot />
