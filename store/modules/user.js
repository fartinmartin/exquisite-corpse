export const state = () => ({
  name: "",
  id: null
});

export const getters = {
  getUserName(state) {
    return state.name;
  },
  getUserId(state) {
    return state.id;
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
