<script lang="ts">
  let {
    src,
    alt = '',
    fallback,
    size = '3rem',
    class: className,
  }: {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: string;
    class?: string;
  } = $props();

  let imgError = $state(false);

  function handleError() {
    imgError = true;
  }
</script>

<div class={['avatar', className]} style:--avatar-size={size}>
  {#if src && !imgError}
    <img class="avatar-image" {src} {alt} onerror={handleError} />
  {:else}
    <span class="avatar-fallback">{fallback ?? alt?.charAt(0)?.toUpperCase() ?? '?'}</span>
  {/if}
</div>

<style>
  .avatar {
    --avatar-size: 3rem;
    position: relative;
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    height: var(--avatar-size);
    width: var(--avatar-size);
    border-radius: var(--radius-full);
  }

  .avatar-image {
    aspect-ratio: 1;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    border-radius: var(--radius-full);
    font-weight: var(--font-weight-medium);
    font-size: calc(var(--avatar-size) * 0.4);
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }
</style>
