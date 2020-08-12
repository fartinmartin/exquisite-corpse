export const state = () => ({
  isHelping: false,
  isAdmin: false,
});

export const getters = {
  isMobile: () => process.client && window.innerWidth < 571, // 571 is when .gallery starts to shrink!
};

export const actions = {
  setIsHelping({ commit }, bool) {
    commit("SET_IS_HELPING", bool);
  },
  setIsAdmin({ commit }, bool) {
    commit("SET_IS_ADMIN", bool);
  },
};

export const mutations = {
  SET_IS_HELPING(state, bool) {
    state.isHelping = bool;
  },
  SET_IS_ADMIN(state, bool) {
    state.isAdmin = bool;
  },
};
