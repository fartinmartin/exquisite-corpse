export const state = () => ({
  completed: null,
  sections: []
});

export const getters = {};

export const actions = {
  async fetchSections({ commit }) {
    // https://stackoverflow.com/questions/56013298/vuex-do-not-mutate-vuex-store-state-outside-mutation-handlers

    let snapshot = await this.$fireStore
      .collection("sections")
      .where("artist", "==", "fartin")
      .get();
    let sections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
      // title: doc.data().title,
      // artist: doc.data().artist,
      // userId: doc.data().userId,
      // type: doc.data().type,
      // date: doc.data().date,
      // drawing: doc.data().drawing,
      // likes: doc.data().likes,
      // featuredIn: doc.data().featuredIn,
      // permalink: doc.data().permalink,
      // thumb: doc.data().thumb
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
