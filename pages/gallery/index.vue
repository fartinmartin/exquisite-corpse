<template>
  <div class="wrap" :class="{ 'section-wrap': collection === 'sections' }">
    <Panel class="filters mb" :class="{ sticky: isMobile }">
      <form>
        <RadioButton group="filter" value="corpses" v-model="type">
          <Icon svg="icons/corpses" data-tooltip="filter by full corpses" />
        </RadioButton>
        <RadioButton group="filter" value="top" v-model="type">
          <Icon svg="icons/tops" data-tooltip="filter by tops" />
        </RadioButton>
        <RadioButton group="filter" value="mid" v-model="type">
          <Icon svg="icons/mids" data-tooltip="filter by mids" />
        </RadioButton>
        <RadioButton group="filter" value="bot" v-model="type">
          <Icon svg="icons/bots" data-tooltip="filter by bots" />
        </RadioButton>
      </form>

      <form>
        <RadioButton group="sort" value="date" v-model="field">
          <Icon data-tooltip="sort by date"> <Date /> </Icon>
        </RadioButton>
        <RadioButton group="sort" value="likes" v-model="field">
          <Icon svg="icons/heart_" data-tooltip="sort by likes" />
        </RadioButton>
      </form>
    </Panel>

    <Loading
      v-if="$fetchState.pending && !isMobile"
      subtext="curating masterpieces"
      :throttle="500"
    />

    <Loading
      v-else-if="$fetchState.error"
      color="red"
      text="oh no"
      subtext="we have misplaced our corpses!"
    />

    <div
      v-else
      class="gallery mw-canvas"
      :class="{ section: collection === 'sections' }"
      ref="gallery"
    >
      <nuxt-link
        v-for="(drawing, i) in gallery"
        :key="`${i}-${drawing.docId}`"
        :to="`/gallery/${galleryType}/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
    <PrevNext
      v-if="!isMobile"
      :isFirstPage="isFirstPage"
      :isLastPage="isLastPage"
      @prev="prevPage"
      @next="nextPage"
      :type="type"
    />
    <Observer v-if="isMobile" @intersect="appendNextPage" />
    <Loading
      v-show="isMobile && !emptyNextResults"
      subtext="curating masterpieces"
      color="yellow"
      class="mt"
      style="padding-top: calc(100% / 3)"
      :throttle="500"
    />
    <Loading
      v-show="isMobile && emptyNextResults"
      text="that's it!"
      subtext="no more masterpieces"
      color="red"
      class="mt"
      style="padding-top: calc(100% / 3)"
      :throttle="500"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { enableBodyScroll } from "body-scroll-lock";
import { handleBodyScroll } from "~/assets/js/handleBodyScroll";
import { galleryMethods } from "~/mixins/galleryMixin";

export default {
  name: "gallery",
  head() {
    return {
      title: "exquisite corpse club ▪ gallery",
      meta: [
        {
          hid: "description",
          name: "description",
          content: `checkout our masterpieces!`
        },
        {
          name: "og:title",
          hid: "og:title",
          content: `exquisite corpse club ▪ gallery`
        },
        {
          name: "og:description",
          hid: "og:description",
          content: `checkout our masterpieces!`
        }
      ]
    };
  },
  mixins: [galleryMethods],
  mounted() {
    this.bodyScrollContainer = document.getElementById("__tino");
    enableBodyScroll(this.bodyScrollContainer);
  },
  beforeDestroy() {
    handleBodyScroll(this.bodyScrollContainer);
  },
  data: () => ({
    bodyScrollContainer: null,
    collection: "corpses", // "corpses", "sections"
    type: "corpses", // "corpses", "top", "mid", and "bot"
    field: "date", // "date", "likes"
    pageSize: 9, // 9, 21
    fetch: "first"
  }),
  watch: {
    type() {
      this.isMobile && window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

      if (this.type === "corpses") {
        this.collection = "corpses";
        this.pageSize = 9;
      } else {
        this.collection = "sections";
        this.pageSize = 21;
      }

      this.fetch = "first";
      this.$fetch();
    },
    field() {
      this.isMobile && window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      this.fetch = "first";
      this.$fetch();
    }
  },
  computed: {
    galleryType() {
      return this.collection.slice(0, -1);
    },
    ...mapGetters(["isMobile"])
  },
  async fetch() {
    this.$store.dispatch("setIsLoading", true);

    if (this.fetch === "first") await this.getCollection();
    else if (this.fetch === "prev") await this.getPrevPage();
    else if (this.fetch === "next") await this.getNextPage();

    this.$store.dispatch("setIsLoading", false);
  },
  methods: {
    prevPage() {
      this.fetch = "prev";
      this.$fetch();
    },

    nextPage() {
      this.fetch = "next";
      this.$fetch();
    }
  }
};
</script>

<style lang="scss">
.filters {
  height: 60px;

  &.sticky {
    position: sticky;
    top: calc(40px / 3);
  }

  .content {
    justify-content: space-between;

    > *:nth-child(1) {
      margin-left: -6px;
    }

    > *:nth-child(2) {
      margin-right: -6px;
    }
  }
}

.section-wrap .loading-wrap {
  padding-top: 92.1292831% !important;
  margin-bottom: 56.15px;
}
</style>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(516px / 3), 1fr));
  grid-template-rows: repeat(auto-fill, minmax(calc(516px / 3), 1fr));
  grid-gap: calc(40px / 3);
  height: 544px;

  @media (max-width: 571px) {
    height: auto;
  }
}

.gallery.section {
  grid-template-rows: repeat(6, max-content);
}

form {
  display: flex;

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}
</style>
