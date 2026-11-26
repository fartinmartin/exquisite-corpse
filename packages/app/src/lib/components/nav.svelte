<script lang="ts">
  import Icon from "./icon.svelte";
  import NavMenu from "./nav-menu.svelte";
  import Panel from "./panel.svelte";
</script>

<div class="nav-wrap">
  <Panel class="nav" noPadding>
    <nav>
      <a href="/" class="logo" data-tooltip="home">
        <h1>ecc</h1>
      </a>
      <NavMenu />
    </nav>
  </Panel>

  <Panel class="me" noPadding>
    <a
      href="https://fartinmartin.github.io/"
      target="_blank"
      rel="noopener noreferrer"
      data-tooltip="cool guy"
      aria-label="martin lindberg"
    >
      <Icon svg="logo/m-light" />
    </a>
  </Panel>
</div>

<style lang="scss">
  .nav-wrap {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }

  :global(.nav),
  :global(.me) {
    position: absolute;
    top: calc(40px / 3);
    z-index: 950;
  }

  :global(.nav.mw-canvas) {
    width: auto;
    left: calc(40px / 3);
    width: auto;
    padding: 0 1rem !important;

    .logo {
      margin-right: 1rem;
      text-decoration: none;
    }

    nav {
      display: flex;
      align-items: center;
    }
  }

  :global(.me.mw-canvas) {
    right: calc(40px / 3);
    width: 60px;
    z-index: 955;
  }
</style>
