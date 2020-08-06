<template>
  <div class="fs-modal help-modal" @click="closeMe">
    <div class="help-wrap">
      <div class="example">
        <Panel class="section" color="blue" no-padding>
          <img src="~/assets/img/tutorial/top.png" alt="" />
        </Panel>
        <Panel class="section mt mb" color="blue" no-padding>
          <img src="~/assets/img/tutorial/mid.png" alt="" />
        </Panel>
        <Panel class="section" color="blue" no-padding>
          <img src="~/assets/img/tutorial/bot.png" alt="" />
        </Panel>
      </div>

      <div class="steps mw-canvas">
        <Panel class="step">
          <p>
            an exquisite corpse is a collaborative drawing made up of three
            sections...
          </p>
        </Panel>
        <Panel class="step mt mb">
          <p>
            each section is drawn by a different artist who can't see the other
            sections!
          </p>
        </Panel>
        <Panel class="step">
          <p>
            sound fun?
          </p>
          <nuxt-link
            to="draw"
            class="button solid yellow"
            @click.native="closeAndDraw"
          >
            <span class="icon">
              <img src="~/assets/img/toolbar/draw.svg" />
            </span>
            start drawing!
          </nuxt-link>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";

export default {
  name: "Help",
  components: { Panel },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  methods: {
    handleShortcuts(e) {
      if (e.keyCode === 27) this.$store.dispatch("setIsHelping", false);
    },
    closeMe(e) {
      if (e.target.classList.contains("help-modal"))
        this.$store.dispatch("setIsHelping", false);
    },
    closeAndDraw() {
      this.$store.dispatch("setIsHelping", false);
    },
  },
};
</script>

<style lang="scss" scoped>
.help-wrap {
  padding: calc(40px / 3);
  max-width: initial;
  width: auto;
  margin: 0 auto;

  display: flex;
}

.example {
  margin-right: calc(40px / 3);

  @media screen and (max-width: 765px) {
    display: none;
  }
}

.steps {
  margin-left: calc(40px / 3);

  @media screen and (max-width: 765px) {
    margin-left: 0;
  }
}

.section,
.step {
  height: 91px;

  @media screen and (max-width: 765px) {
    height: auto;
  }
}

.section {
  width: 272px;
  overflow: hidden;
}

.step {
  display: grid;
  place-items: center;
  text-align: center;

  &:last-child {
    justify-content: stretch;
    .content > * {
      width: 50%;
    }
  }
}

p {
  max-width: 46ch;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    margin-right: 0.5rem;
  }
}
</style>
