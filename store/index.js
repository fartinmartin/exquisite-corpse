export const state = () => ({
  isHelping: false
});

export const getters = {};

export const actions = {
  setIsHelping({ commit }, bool) {
    commit("SET_IS_HELPING", bool);
  }
};

export const mutations = {
  SET_IS_HELPING(state, bool) {
    state.isHelping = bool;
  }
};
