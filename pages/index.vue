<template>
  <div class="wrap">
    <Panel class="mb index-nav">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <NavMenu style="margin-right: -6px" />
    </Panel>

    <Loading v-if="$fetchState.pending" subtext="digging up a random corpse" />
    <Loading
      v-else-if="$fetchState.error"
      color="red"
      text="oh no"
      subtext="we have misplaced our corpses!"
    />
    <Display v-else :sections="sections" />

    <Panel class="mt index-title">
      <nuxt-link v-if="fetchSuccessful" :to="`/gallery/corpse/${corpse.docId}`">
        {{ corpse.title }}
      </nuxt-link>
    </Panel>
  </div>
</template>

<script>
// TODO: make all data fetches from pages asyncData() methods???
import { getRandomCorpse } from "~/mixins/getRandomCorpseMixin";
import { getSections } from "~/mixins/getSectionsMixin";
import { openHelp } from "~/mixins/openHelpMixin";

export default {
  name: "index",
  mixins: [getRandomCorpse, getSections],
  async fetch() {
    this.$store.dispatch("setIsLoading", true);
    await this.getRandomCorpse();
    await this.getSections(this.corpse.sections);
    this.$store.dispatch("setIsLoading", false);
  },
  computed: {
    fetchSuccessful() {
      return !this.$fetchState.pending && !this.$fetchState.error;
    }
  }
};
</script>

<style lang="scss">
.index-nav,
.index-title {
  height: 60px;
}

.index-nav > .content {
  justify-content: space-between;
}

.index-title a:hover {
  text-decoration: underline;
  color: var(--blue);
}
</style>
