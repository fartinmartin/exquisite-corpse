<div class="hero">
	<div class="grid">
		<p class="panel">welcome to the</p>
		<h1>
			<span class="panel blue">exquisite</span>
			<span class="panel blue">corpse</span>
			<span class="panel blue">club</span>
		</h1>
		<p class="panel red">a collaborative drawing game</p>
		<!-- <p class="cta">pick up the pencil and draw a corpse!</p> -->
	</div>
</div>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}

	h1 {
		font-family: var(--font-wide);
		font-weight: 700;
		font-size: 2rem;

		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: center;
	}

	p {
		width: fit-content;
		font-size: 0.875rem;
		margin: 1rem 0;
	}

	.panel {
		--border-size: 2px;
		--border-color: var(--red-100);
		--box-shadow-size: 2px;
		--box-shadow-color: var(--red-200);

		border: var(--border-size) solid var(--border-color);
		/* box-shadow: var(--box-shadow-size) var(--box-shadow-size) 0 0
			var(--box-shadow-color); */
		background: var(--white);

		padding: 1rem;
	}

	.panel.yellow {
		--border-color: var(--yellow-200);
		--box-shadow-color: var(--yellow-300);
	}

	.panel.blue {
		--border-color: var(--blue-200);
		--box-shadow-color: var(--blue-300);
	}

	.panel.red {
		--border-color: var(--red-200);
		--box-shadow-color: var(--red-300);
	}

	.panel.green {
		--border-color: var(--green-200);
		--box-shadow-color: var(--green-300);
	}
</style>
