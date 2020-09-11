// doesn't seem to work in components:
// "Property or method "fetchSuccessful" is not defined on the instance but referenced during render."
export const fetchSuccessful = {
  computed: {
    fetchSuccessful() {
      return !this.$fetchState.pending && !this.$fetchState.error;
    }
  }
};
