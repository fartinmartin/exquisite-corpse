export const state = () => ({
  isHelping: false,
  baseURL: "https://exquisitecorpse.club",
  randomCompleted: {}
});

export const getters = {};

export const actions = {
  setIsHelping({ commit }, bool) {
    commit("SET_IS_HELPING", bool);
  },
  async fetchRandomCompleted({ commit }) {}
  // get random section
  // get random completed
  // get section by id
  // get completed by id
  // get paginated completed
  // get paginated top, mid, bot sections (probs not)
};

export const mutations = {
  SET_IS_HELPING(state, bool) {
    state.isHelping = bool;
  },
  SET_RANDOM_COMPLETED(state, completed) {
    state.randomCompleted = completed;
  }
};
