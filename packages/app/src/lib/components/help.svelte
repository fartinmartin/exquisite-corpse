<script lang="ts">
  import { help } from "$lib/help.svelte";
  import Button from "./button.svelte";
  import Icon from "./icon.svelte";
  import Panel from "./panel.svelte";

  function close(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains("help-modal")) help.hide();
  }

  $effect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.code === "Escape") help.hide();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });
</script>

<div class="fs-modal help-modal" onclick={close} role="presentation">
  <div class="help-wrap">
    <div class="example">
      <Panel class="section" color="blue" noPadding>
        <img src="/img/tutorial/top.png" alt="example top" />
      </Panel>
      <Panel class="section mt mb" color="blue" noPadding>
        <img src="/img/tutorial/mid.png" alt="example mid" />
      </Panel>
      <Panel class="section" color="blue" noPadding>
        <img src="/img/tutorial/bot.png" alt="example bot" />
      </Panel>
    </div>

    <div class="steps mw-canvas">
      <Panel class="step">
        <p>an exquisite corpse is a collaborative drawing made up of three sections...</p>
      </Panel>
      <Panel class="step mt mb">
        <p>each section is drawn by a different artist who can't see the other sections!</p>
      </Panel>
      <Panel class="step">
        <p>sound fun?</p>
        <Button color="yellow">
          <a href="/draw" onclick={() => help.hide()}>
            <span class="icon hom">
              <img src="/img/toolbar/draw.svg" alt="" />
            </span>
            start drawing!
          </a>
        </Button>
      </Panel>
    </div>
  </div>
</div>

<style lang="scss">
  .help-wrap {
    max-width: initial;
    width: auto;
    margin: 0 auto;

    display: flex;
  }

  .example {
    margin-right: calc(40px / 3);

    @media screen and (max-width: 765px) {
      display: none;
    }
  }

  .steps {
    margin-left: calc(40px / 3);

    @media screen and (max-width: 765px) {
      margin-left: 0;
    }
  }

  :global(.section),
  :global(.step) {
    height: 91px;

    @media screen and (max-width: 765px) {
      height: auto;
    }
  }

  :global(.section) {
    width: 272px;
    overflow: hidden;
  }

  :global(.step) {
    display: grid;
    place-items: center;
    text-align: center;

    :global(.content) {
      font-size: 1rem;
    }

    &:last-child :global(a) {
      display: flex;
      align-items: center;
    }
  }

  :global(.step:last-child .content) {
    justify-content: stretch;
  }

  :global(.step:last-child .content > *) {
    width: 50%;
  }

  p {
    max-width: 46ch;
  }

  .icon {
    margin-right: 0.5rem;
  }
</style>
