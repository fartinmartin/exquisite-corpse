<template>
  <div class="wrap">
    <Loading v-if="$fetchState.pending" subtext="waking up our artists" />

    <Loading
      v-else-if="$fetchState.error"
      color="red"
      text="oh no"
      subtext="we have misplaced our corpses!"
    />

    <Display v-else :sections="sections" />

    <!-- <Panel class="mt corpse-meta" :is-loading="fetchSuccessful"> -->
    <Panel class="mt corpse-meta">
      <h1 v-if="fetchSuccessful">{{ corpse.title }}</h1>
      <MetaMenu v-if="fetchSuccessful" collection="corpses" :doc="corpse" />
    </Panel>
  </div>
</template>

<script>
import { getCorpseById } from "~/mixins/getCorpseByIdMixin";
import { getSections } from "~/mixins/getSectionsMixin";

export default {
  name: "Corpse",
  mixins: [getCorpseById, getSections],
  head() {
    return {
      title: `exquisite corpse club ▪ ${this.corpse.title}`
    };
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 60000 * 5) {
      this.$fetch();
    }
  },
  async fetch() {
    this.$store.dispatch("setIsLoading", true);
    await this.getCorpseById(this.$route.params.id);
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
.corpse-meta {
  height: 60px;

  > .content {
    justify-content: space-between;

    > *:nth-child(2) {
      margin-right: -6px;
    }
  }
}
</style>
