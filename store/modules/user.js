export const state = () => ({
  id: null,
  displayName: ""
});

export const getters = {
  getUser(state) {
    return { displayName: state.displayName, id: state.id };
  }
};

export const actions = {
  signInAnonymously({ commit }, user) {
    this.$fireAuth.signInAnonymously();
    this.$fireAuth.onAuthStateChanged(user => {
      if (user) {
        store.commit("SET_USER", user);
      } else {
        store.commit("SET_USER", null);
      }
    });
  }
};

export const mutations = {
  SET_USER(state, user) {
    if (user) {
      state.name = user.isAnonymous
        ? `anonymous-${user.uid.substr(1, 4)}`
        : user.displayName;
      state.id = user.uid;
    }
  }
};
