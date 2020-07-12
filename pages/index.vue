<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <!-- <Alert /> -->
        <div class="info border yellow">
          <h1>exquisite corpse club</h1>
        </div>
        <div class="info border yellow">
          <!-- <span>wait, the what now?</span> -->
          <div class="links">
            <nuxt-link to="/">
              <div class="icon">🤔</div>
            </nuxt-link>
            <nuxt-link to="/gallery">
              <div class="icon">🖼</div>
            </nuxt-link>
            <nuxt-link to="/draw">
              <div class="icon draw">
                <img src="~/assets/img/toolbar/draw.svg?data" />
              </div>
            </nuxt-link>
          </div>
        </div>
        <Display
          style="margin-top: calc(40px / 3)"
          :sections="{
            top: section1,
            mid: section2,
            bot: section3
          }"
        />
        <!-- <div class="info border yellow">
          <nuxt-link to="/gallery" class="button">
            peep the gallery
          </nuxt-link>
          <nuxt-link to="/draw" class="button">
            start drawing!
          </nuxt-link>
        </div> -->
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
$icon-size: 25px;

a {
  text-decoration: none;
}

.icon {
  font-size: 1rem;
  width: $icon-size;
  height: $icon-size;

  box-sizing: content-box;
  border: 2px solid transparent;

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3D(2px, 2px, 0);
  }
}

h1 {
  font-size: 1.25rem;
}

.info {
  padding: 1rem;
  height: 60px;
  margin-top: calc(40px / 3);
  display: flex;
  align-items: center;
  justify-content: center;

  .button {
    width: 50%;
  }

  &:first-child {
    margin-top: 0;
  }
}

.links {
  font-size: 1.25rem;
  display: flex;
  justify-content: space-between;
  width: 21ch;
}

.link {
  /* margin: -1rem; */
  /* padding: 1rem;
  text-align: center;
  width: 100%;

  text-decoration: none;
  color: var(--black);

  &:first-child {
    margin-right: calc(40px / 3 / 2);
  }
  &:last-child {
    margin-left: calc(40px / 3 / 2);
  } */
}
</style>
