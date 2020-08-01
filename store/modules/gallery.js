export const state = () => ({
  corpse: {},
  sections: {},
});

export const getters = {
  getDocById: (state) => (docId) => {
    return state.corpse[docId] || state.sections[docId];
  },
};

export const actions = {
  pushDocToStore({ commit }, doc) {
    if (doc.collection === "corpse") {
      commit("PUSH_CORPSE_TO_STORE", doc);
    } else {
      commit("PUSH_SECTOION_TO_STORE", doc);
    }
  },
};

export const mutations = {
  PUSH_CORPSE_TO_STORE(state, doc) {
    state.corpse[doc.docId] = doc;
  },
  PUSH_SECTION_TO_STORE(state, doc) {
    state.sections[doc.docId] = doc;
  },
};
