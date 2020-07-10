export const state = () => ({
  drawings: []
});

export const getters = {
  getGallery(state) {
    return state.drawings;
  }
};

export const actions = {
  async setGallery({ dispatch, commit }) {
    const drawings = await dispatch("getDrawingsFromFirestore");
    commit("SET_GALLERY", drawings);
  },
  async getDrawingsFromFirestore() {
    const drawingsRef = this.$fireStore.collection("drawings");
    try {
      const collection = await drawingsRef.get();
      const data = collection.docs.map(doc => doc.data());
      return data;
    } catch (e) {
      console.error(e);
      return;
    }
  }
};

export const mutations = {
  SET_GALLERY(state, drawings) {
    state.drawings = drawings;
  }
};
