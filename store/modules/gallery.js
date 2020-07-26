export const state = () => ({
  completed: {},
  sections: {},
});

export const getters = {
  getDocById: (state) => (docId) => {
    return state.completed[docId] || state.sections[docId];
  },
};

export const actions = {
  pushDocToStore({ commit }, doc) {
    if (doc.collection === "completed") {
      commit("PUSH_COMPLETED_TO_STORE", doc);
    } else {
      commit("PUSH_SECTOION_TO_STORE", doc);
    }
  },
};

export const mutations = {
  PUSH_COMPLETED_TO_STORE(state, doc) {
    state.completed[doc.docId] = doc;
  },
  PUSH_SECTION_TO_STORE(state, doc) {
    state.sections[doc.docId] = doc;
  },
};
