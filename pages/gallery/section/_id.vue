<template>
  <div class="wrap">
    <Loading v-if="$fetchState.pending" subtext="preparing our canvas" />

    <Loading
      v-else-if="$fetchState.error"
      color="red"
      text="oh dear"
      subtext="we could not find this section!"
    />

    <Canvas v-else :id="section.docId" mode="display" :section="section" />

    <!-- <Panel class="mt meta" :is-loading="$fetchState"> -->
    <Panel class="mt meta">
      <div v-if="fetchSuccessful">
        <h1>
          {{ section.title }} <span><br class="br" />by</span>
          {{ section.artist }}
        </h1>
      </div>
      <MetaMenu v-if="fetchSuccessful" collection="sections" :doc="section" />
    </Panel>

    <!-- <Panel class="mt meta" :is-loading="$fetchState"> -->
    <Panel class="mt mb related">
      <form v-if="fetchSuccessful">
        <div>
          <input
            type="radio"
            id="featuredIn"
            name="toggle"
            value="featuredIn"
            v-model="related.toggle"
          />
          <label for="featuredIn">
            <h2 class="icon interactive">
              feat<span class="hom">ured in...</span>
            </h2>
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="moreBy"
            name="toggle"
            value="moreBy"
            v-model="related.toggle"
          />
          <label for="moreBy">
            <h2 class="icon interactive">
              more <span class="hom">&nbsp;by this artist... </span>
            </h2>
          </label>
        </div>
      </form>
    </Panel>

    <Loading
      v-if="$fetchState.pending && related.toggle === 'featuredIn'"
      subtext="checkin out the studio"
      style="padding-top: 31.6176471% !important"
    />

    <Loading
      v-else-if="$fetchState.error"
      text="srsy, sry"
      color="red"
      style="padding-top: 31.6176471% !important"
    />

    <div
      v-else-if="related.toggle === 'featuredIn'"
      class="gallery mw-canvas"
      :class="{ more: related.toggle === 'moreBy' }"
    >
      <nuxt-link
        v-for="drawing in related.featuredIn"
        :key="drawing.docId"
        :to="`/gallery/corpse/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>

    <div v-else-if="related.toggle === 'moreBy'" class="gallery more-by">
      <div v-if="!related.moreBy.length" class="none-found">
        <Panel color="blue" style="width: max-content; margin: 0 auto">
          no drawings found!
        </Panel>
      </div>
      <nuxt-link
        v-for="drawing in related.moreBy"
        :key="drawing.docId"
        :to="`/gallery/section/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { getSectionById, getRelated } from "~/mixins/getSectionByIdMixin";

export default {
  name: "Section",
  head() {
    return {
      title: `exquisite corpse club ▪ ${this.section.title} by ${this.section.artist}`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: `a ${this.currentType} third of an exquisite corpse!`
        },
        {
          name: "og:title",
          hid: "og:title",
          content: `exquisite corpse club ▪ ${this.section.title} by ${this.section.artist}`
        },
        {
          name: "og:description",
          hid: "og:description",
          content: `a ${this.currentType} third of an exquisite corpse!`
        },
        {
          name: "og:image",
          hid: "og:image",
          content: `${this.section.thumb}`
        }
      ]
    };
  },
  mixins: [getSectionById, getRelated],
  data: () => ({
    related: { toggle: "featuredIn" }
  }),
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 60000 * 5) {
      this.$fetch();
    }
  },
  async fetch() {
    this.$store.dispatch("setIsLoading", true);
    await this.getSectionById(this.$route.params.id);
    if (this.section.title) {
      await this.getFeaturedIn();
      await this.getMoreBy();
      this.$store.dispatch("setIsLoading", false);
    } else {
      this.$store.dispatch("setIsLoading", false);
      if (process.server) this.$nuxt.context.res.statusCode = 404;
      throw new Error("Section not found!");
    }
  },
  computed: {
    fetchSuccessful() {
      return !this.$fetchState.pending && !this.$fetchState.error;
    },
    currentType() {
      switch (this.section.type) {
        case "bot":
          return `bottom`;
          break;
        case "mid":
          return `middle`;
          break;
        default:
          return this.section.type;
          break;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-wrap {
  padding-top: calc(calc(100% + 8px) / 3) !important;
}

h1,
h2 {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    font-weight: normal;
  }

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    white-space: normal;
  }
}
</style>

<style lang="scss">
.meta,
.related {
  height: 60px;
}

.meta {
  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    height: auto;
  }

  .br {
    @media screen and (min-width: 444px) {
      display: none;
    }
  }
}

.meta > .content {
  justify-content: space-between;

  > *:nth-child(2) {
    margin-right: -6px;
  }
}

.related > .content {
  justify-content: flex-start;
  margin-left: calc(-1rem - 7px);
}

.related {
  margin-top: 120px;

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    margin-top: calc(40px / 3);
  }
}
</style>

<style lang="scss">
// TODO: below sections should be made into components
</style>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(1, calc(516px / 3));
  grid-gap: calc(40px / 3);

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: calc(calc(100vw - 40px) / 3);
  }
}

.gallery.more-by {
  grid-template-rows: repeat(2, max-content);
  min-height: 172px;
  position: relative;

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    grid-template-rows: calc(calc(100vw - 40px) / 3);
    min-height: initial;
  }
}

.none-found {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}
</style>

<style lang="scss" scoped>
form {
  display: flex;

  .icon {
    width: auto;
    padding: 0 5px;
  }

  input {
    display: none;
  }

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}

input:checked + label * {
  font-weight: bold;
  opacity: 1;
}

input:not(:checked) + label h2 {
  font-weight: normal;
  opacity: 0.5;
}
</style>
