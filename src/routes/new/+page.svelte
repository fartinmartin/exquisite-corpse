<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;

	const handleSubmit = async (e: SubmitEvent) => {
		const formData = new FormData(e.target as HTMLFormElement);
		const file = formData.get("file") as File;

		const image = await fetch(data.url, {
			body: file,
			method: "PUT",
			headers: {
				"Content-Type": file.type,
				"Content-Disposition": `attachment; filename="${file.name}"`,
			},
		});

		window.location.href = image.url.split("?")[0];
	};
</script>

<section>
	<form on:submit|preventDefault={handleSubmit}>
		<input name="file" type="file" accept="image/png, image/jpeg" />
		<button type="submit">Upload</button>
	</form>
</section>
