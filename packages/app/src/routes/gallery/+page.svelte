<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import DateIcon from "#lib/components/date-icon.svelte";
  import Icon from "#lib/components/icon.svelte";
  import Panel from "#lib/components/panel.svelte";
  import RadioButton from "#lib/components/radio-button.svelte";
  import GalleryGrid from "./gallery-grid.svelte";

  type Filter = "corpses" | "top" | "mid" | "bot";
  type Sort = "date" | "likes";

  const FILTERS: { value: Filter; icon: string; tooltip: string }[] = [
    { value: "corpses", icon: "icons/corpses", tooltip: "filter by full corpses" },
    { value: "top", icon: "icons/tops", tooltip: "filter by tops" },
    { value: "mid", icon: "icons/mids", tooltip: "filter by mids" },
    { value: "bot", icon: "icons/bots", tooltip: "filter by bots" },
  ];

  let filter = $state<Filter>("corpses");
  let sort = $state<Sort>("date");
  let page = $state(0);
  let mobile = $state(false);

  $effect(() => {
    const query = window.matchMedia("(max-width: 571px)");
    mobile = query.matches;
    const listener = (event: MediaQueryListEvent) => (mobile = event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  });

  // A new filter/sort always starts from the first page.
  $effect(() => {
    void filter;
    void sort;
    page = 0;
  });
</script>

<Seo title="gallery" description="checkout our masterpieces!" />

<div class="wrap" class:section-wrap={filter !== "corpses"}>
  <Panel class={`filters mb ${mobile ? "sticky" : ""}`}>
    <form>
      {#each FILTERS as option (option.value)}
        <RadioButton
          group="filter"
          value={option.value}
          active={filter}
          onselect={(value) => (filter = value as Filter)}
        >
          <Icon svg={option.icon} tooltip={option.tooltip} />
        </RadioButton>
      {/each}
    </form>

    <form>
      <RadioButton
        group="sort"
        value="date"
        active={sort}
        onselect={() => (sort = "date")}
      >
        <Icon tooltip="sort by date">
          <DateIcon />
        </Icon>
      </RadioButton>
      <RadioButton
        group="sort"
        value="likes"
        active={sort}
        onselect={() => (sort = "likes")}
      >
        <Icon svg="icons/heart_" tooltip="sort by likes" />
      </RadioButton>
    </form>
  </Panel>

  {#key `${filter}-${sort}`}
    <GalleryGrid {filter} {sort} {page} {mobile} onpage={(next) => (page = next)} />
  {/key}
</div>

<style lang="scss">
  :global(.filters) {
    height: 60px;

    :global(.content) {
      justify-content: space-between;

      > *:nth-child(1) {
        margin-left: -6px;
      }

      > *:nth-child(2) {
        margin-right: -6px;
      }
    }
  }

  :global(.filters.sticky) {
    position: sticky;
    top: calc(40px / 3);
  }

  :global(.section-wrap .loading-wrap) {
    padding-top: 92.1292831% !important;
    margin-bottom: 56.15px;
  }

  form {
    display: flex;

    > :global(*:not(:last-child)) {
      margin-right: 1rem;
    }
  }
</style>
