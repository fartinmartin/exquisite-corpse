<script>
	// https://support.google.com/adsense/answer/9274025
	// https://stackoverflow.com/questions/69091120/how-to-add-google-adsense-to-a-svelte-sapper-web-app
	onMount(() => {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	});
</script>

<div class="ads-widget-container">
	<ins
		class="adsbygoogle"
		style="display:block"
		data-ad-client="ca-pub-X0X0X0X0X0X0X"
		data-ad-slot="X0X0X0X0X0X0"
		data-ad-format="auto"
		data-full-width-responsive="true"
	/>
</div>
