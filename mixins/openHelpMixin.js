export const openHelp = {
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    }
  }
};
