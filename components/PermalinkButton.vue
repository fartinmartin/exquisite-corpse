<template>
  <button
    @click="copyURL"
    :aria-label="isCopied ? 'link copied!' : 'share link'"
  >
    <Icon :data-tooltip="isCopied ? 'link copied!' : 'share link'">
      <transition name="slide-fade">
        <img
          v-if="isCopied"
          class="is-copied"
          src="~/assets/img/icons/copy.svg"
          alt=""
        />
      </transition>
      <transition name="fade">
        <img v-if="!isCopied" src="~/assets/img/icons/link.svg" alt="" />
      </transition>
    </Icon>
  </button>
</template>

<script>
// 🚨 in dev mode, navigator.clipboard only works on localhost
export default {
  name: "PermalinkButton",
  props: { collection: String, docId: String },
  data: () => ({ isCopied: false }),
  computed: {
    type() {
      return this.collection.slice(0, -1);
    },
    url() {
      return `https://exquisitecorpse.club/gallery/${this.type}/${this.docId}`;
    }
  },
  methods: {
    async copyURL() {
      if (!navigator.clipboard) {
        this.fallbackCopyURL();
        return;
      }
      try {
        await navigator.clipboard.writeText(this.url);
        this.isCopied = true;
        setTimeout(() => (this.isCopied = false), 1500);
      } catch (error) {
        console.log(error);
      }
    },
    fallbackCopyURL() {
      const textArea = document.createElement("textarea");
      textArea.value = this.url;

      // Avoid scrolling to bottom
      textArea.style.opacity = "0";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 1500);
    }
  }
};
</script>

<style lang="scss" scoped>
.fade-enter-active {
  transition-delay: 0.5s;
  transition: all 0.2s ease;
}

.fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition-delay: 0.5s;
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.icon {
  position: relative;
}

.is-copied {
  position: absolute;
  width: 100%;
}
</style>
