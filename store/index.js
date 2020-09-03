export const state = () => ({
  isHelping: false,
  isAdmin: false,
  isLoading: false,
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
  setIsLoading({ commit }, bool) {
    commit("SET_IS_LOADING", bool);
  },
};

export const mutations = {
  SET_IS_HELPING(state, bool) {
    state.isHelping = bool;
  },
  SET_IS_ADMIN(state, bool) {
    state.isAdmin = bool;
  },
  SET_IS_LOADING(state, bool) {
    state.isLoading = bool;
  },
};
