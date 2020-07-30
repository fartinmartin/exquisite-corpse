<template>
  <div>
    <PrevNext v-if="query.pageSize > 9" />
    <Loading
      v-if="isFetching !== 'success'"
      :subtext="loadingText || `curating masterpieces`"
    />
    <!-- :style="{ height: query.pageSize > 9 ? `542.667px` : `100px` }" -->
    <!-- sizing the height of the loading component gets tricky with mobile styles -->
    <!-- maybe the loading component needs to be absolutely positioned and 100% height of .gallery -->
    <div
      v-if="isFetching === 'success'"
      class="gallery mw-canvas"
      :class="{ section: collection === 'sections' }"
    >
      <nuxt-link
        v-for="drawing in gallery"
        :key="drawing.docId"
        :to="`/${collection === 'completed' ? 'gallery' : 'gallery/section'}/${
          drawing.docId
        }`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Loading from "~/components/Loading.vue";
import Drawing from "~/components/Drawing.vue";
import PrevNext from "~/components/PrevNext.vue";

export default {
  name: "Gallery",
  components: { Loading, Drawing, PrevNext },
  props: {
    gallery: {
      type: Object,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    loadingText: String, // customize loading subtext
  },
  data: function () {
    return {
      isFetching: "idle",
      gallery: [{ docId: "temp" }],
      firstItemId: "",
      lastVisible: null,
      firstVisible: null,
    };
  },
  mounted() {
    this.fetchFirst();
  },
};
</script>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(3, calc(516px / 3));
  grid-gap: calc(40px / 3);
}

.gallery.section {
  grid-template-rows: repeat(6, max-content);
  min-height: 542.667px;
}
</style>
