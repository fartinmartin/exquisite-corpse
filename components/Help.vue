<template>
  <div class="help-modal" @click="closeMe">
    <div>
      <div class="help-wrap">
        <div>
          <div class="border section" id="top-h">
            <img src="~/assets/img/tutorial/top.png" alt="" />
          </div>
          <div class="border section" id="mid-h">
            <img src="~/assets/img/tutorial/mid.png" alt="" />
          </div>
          <div class="border section" id="bot-h">
            <img src="~/assets/img/tutorial/bot.png" alt="" />
          </div>
        </div>

        <div class="steps">
          <div class="step one border yellow">
            <p>
              an exquisite corpse is a collaborative drawing made up of three
              sections...
            </p>
          </div>
          <div class="step two border yellow">
            <p>
              each section is drawn by a different artist who can't see the
              other sections!
            </p>
          </div>
          <div class="step three border yellow">
            <p>
              sound fun?
            </p>
            <nuxt-link
              to="draw"
              class="button solid yellow"
              @click.native="closeAndDraw"
            >
              start drawing!
            </nuxt-link>
          </div>
        </div>

        <!-- <div class="nav">
          <button disabled>back</button>
          <button @click.prevent="step++">next</button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Help",
  data: function() {
    return { step: 1 };
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  methods: {
    handleShortcuts(e) {
      if (e.keyCode === 27) {
        // esc
        this.step = 1;
        this.$store.dispatch("setIsHelping", false);
      }
    },
    closeMe(e) {
      if (
        e.target.className === "help-modal" ||
        e.target.className === "we-done"
      ) {
        this.step = 1;
        this.$store.dispatch("setIsHelping", false);
      }
    },
    closeAndDraw() {
      this.$store.dispatch("setIsHelping", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.help-wrap {
  display: flex;
  flex-wrap: wrap;
}

.nav {
  width: 100%;
}

.step,
.section {
  background: var(--white);
  width: 272px;
  height: 91px;
  overflow: hidden;
  margin: calc(40px / 3);

  display: flex;
  align-items: center;
  justify-content: center;
}

.section {
  margin-left: 0;
}

.step {
  text-align: center;
  width: 544px;
  padding: 1rem;
  margin-right: 0;
  p {
    max-width: 46ch;
  }

  &.three {
    display: flex;
    > * {
      width: 50%;
    }
  }
}

.close-me {
  position: absolute;
  z-index: 950;
  background: green;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.help-modal {
  position: absolute;
  z-index: 951;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: var(--lighter-blue)
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC)
    repeat;
  background-blend-mode: overlay;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
