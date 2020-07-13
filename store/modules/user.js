export const state = () => ({
  id: null,
  displayName: ""
});

export const getters = {};

export const actions = {
  signInAnonymously({ commit }) {
    this.$fireAuth
      .signInAnonymously()
      .then(function(response) {
        commit("SET_USER", response.user);
      })
      .catch(function(error) {
        console.error(error);
      });
  }
};

export const mutations = {
  SET_USER(state, user) {
    if (user) {
      state.name = user.isAnonymous
        ? `anonymous-${user.uid.substr(1, 4)}` // TODO: use a random word from Wordnik API
        : user.displayName;
      state.id = user.uid;
    }
  }
};
