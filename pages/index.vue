<template>
  <div class="wrap">
    <Panel class="mb index-nav">
      <h1>exquisite corpse club</h1>
      <NavMenu />
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
import { getRandomCorpse } from "~/mixins/getRandomCorpseMixin";
import { getSections } from "~/mixins/getSectionsMixin";
import { openHelp } from "~/mixins/openHelpMixin";

export default {
  name: "index",
  mixins: [getRandomCorpse, getSections],
  async fetch() {
    this.$store.dispatch("setIsLoading", true);
    await this.getRandomCorpse();
    if (this.corpse.sections) {
      await this.getSections(this.corpse.sections);
      this.$store.dispatch("setIsLoading", false);
    } else {
      this.$store.dispatch("setIsLoading", false);
      if (process.server) this.$nuxt.context.res.statusCode = 404;
      throw new Error("Corpse not found!");
    }
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
</style>
