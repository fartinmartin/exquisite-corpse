<template>
  <div class="wrap">
    <nav class="border yellow">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <div class="links">
        <button @click.prevent="openHelp">
          <div class="icon">
            <img src="~/assets/img/icons/info.svg" />
          </div>
        </button>
        <nuxt-link
          to="/gallery"
          :class="{ active: this.$route.name !== 'gallery' }"
        >
          <div class="icon">
            <img src="~/assets/img/icons/gallery.svg" />
          </div>
        </nuxt-link>
        <nuxt-link to="/draw" :class="{ active: this.$route.name !== 'draw' }">
          <div class="icon">
            <img src="~/assets/img/toolbar/draw.svg" />
          </div>
        </nuxt-link>
      </div>
    </nav>

    <Display v-if="sections" :sections="sections" />
  </div>
</template>

<script>
import Display from "~/components/Display";
import drawings from "~/assets/js/drawings.json";

export default {
  name: "index",
  components: { Display },
  data: function() {
    return {
      sections: {
        top: drawings[1],
        mid: drawings[0],
        bot: drawings[2]
      }
    };
  },
  async mounted() {
    // fetch random completed drawing!
  },
  mounted() {
    // this.$store.dispatch("modules/gallery/fetchSections");
    // https://stackoverflow.com/questions/46798981/firestore-how-to-get-random-documents-in-a-collection
    // 🤔 generate random timestamp between date of database "birth" and now.. and find doc with closest date... 🤷‍♂️
  },
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  flex-direction: column;
}

nav {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 544px;
  margin-bottom: calc(40px / 3);
}

h1 {
  font-size: 1rem;
}

.icon {
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  box-sizing: content-box;
  border: 2px solid transparent;

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3d(2px, 2px, 0);
  }
}

.links {
  display: flex;

  > * {
    margin-left: 1rem;
  }
}
</style>
