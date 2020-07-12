<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <Alert />
        <div class="info">
          <h1 class="border yellow link">exquisite corpse club</h1>
          <button class="border yellow link">wait, the what now?</button>
        </div>
        <Display
          style="margin-top: calc(40px / 3)"
          :sections="{
            top: section1,
            mid: section2,
            bot: section3
          }"
        />
        <div class="info">
          <nuxt-link to="/gallery" class="border yellow link">
            peep the gallery
          </nuxt-link>
          <nuxt-link to="/draw" class="border yellow link">
            start drawing!
          </nuxt-link>
        </div>
      </div>
    </div>
    <CustomCursor />
  </div>
</template>

<script>
import About from "~/components/About";
import Alert from "~/components/Alert";
import Display from "~/components/Display";
import CustomCursor from "~/components/CustomCursor";
import section1 from "~/assets/js/drawing1.json";
import section2 from "~/assets/js/drawing2.json";
import section3 from "~/assets/js/drawing3.json";

export default {
  name: "index",
  data() {
    return {
      section1,
      section2,
      section3
    };
  },
  components: { CustomCursor, About, Display, Alert }
};
</script>

<style lang="scss" scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* .two-by-one {
  display: grid;
  grid-template-columns: repeat(2, 544px);
  gap: 40px;
} */

h1 {
  font-size: 1rem;
}

.info {
  /* padding: 1rem; */
  height: 60px;
  margin-top: calc(40px / 3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.link {
  /* margin: -1rem; */
  padding: 1rem;
  text-align: center;
  width: 100%;

  text-decoration: none;
  color: var(--black);

  &:first-child {
    margin-right: calc(40px / 3 / 2);
  }
  &:last-child {
    margin-left: calc(40px / 3 / 2);
  }
}
</style>
