export const state = () => ({
  completed: [],
  sections: []
});

export const getters = {};

export const actions = {
  async fetchSections({ commit }) {
    // https://stackoverflow.com/questions/56013298/vuex-do-not-mutate-vuex-store-state-outside-mutation-handlers

    let snapshot = await this.$fireStore
      .collection("sections")
      .where("artist", "==", "smol")
      .get();
    let sections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // console.log(sections);
    // commit("SET_SECTIONS", sections);
  }
};

export const mutations = {
  SET_SECTIONS(state, sections) {
    state.sections = sections;
  }
};
