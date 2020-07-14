export const state = () => ({
  completed: [],
  sections: []
});

export const getters = {};

export const actions = {};

export const mutations = {
  SET_SECTIONS(state, sections) {
    state.sections = sections;
  }
};
