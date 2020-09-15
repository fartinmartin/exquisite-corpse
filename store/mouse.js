export const state = () => ({
  x: 0,
  y: 0,
  isDrawing: false,
  mode: "draw",
  size: {
    current: 5,
    min: 1,
    max: 10
  },
  palette: {
    current: "#000000",
    colors: [
      "#000000",
      "#F44E3B",
      "#FE9200",
      "#FCDC00",
      "#A4DD00",
      "#68CCCA",
      "#AEA1FF",
      "#FDA1FF"
    ]
  }
});

export const getters = {
  canGrow(state) {
    return state.size.current < state.size.max;
  },
  canShrink(state) {
    return state.size.current > state.size.min;
  }
};

export const actions = {
  resetMouse({ commit }) {
    commit("SET_MODE", "draw");
    commit("SET_SIZE", 5);
    commit("SET_COLOR", "#000000");
  },
  setMousePosition({ commit }, event) {
    commit("SET_MOUSE_POSITION", event);
  },
  setIsDrawing({ commit }, isDrawing) {
    commit("SET_IS_DRAWING", isDrawing);
  },
  setMode({ commit }, value) {
    commit("SET_MODE", value);
  },
  incrementSize({ commit, getters }) {
    getters.canGrow && commit("INCREMENT_SIZE");
  },
  decrementSize({ commit, getters }) {
    getters.canShrink && commit("DECREMENT_SIZE");
  },
  setColor({ commit }, color) {
    commit("SET_COLOR", color);
  },
  addColor({ commit, dispatch, state }, color) {
    state.palette.colors.includes(color) ? null : commit("ADD_COLOR", color);
    dispatch("setColor", color);
  }
};

export const mutations = {
  SET_MOUSE_POSITION(state, event) {
    state.x = event.offsetX;
    state.y = event.offsetY;
  },
  SET_IS_DRAWING(state, isDrawing) {
    state.isDrawing = isDrawing;
  },
  SET_MODE(state, value) {
    state.mode = value;
  },
  INCREMENT_SIZE(state) {
    state.size.current++;
  },
  DECREMENT_SIZE(state) {
    state.size.current--;
  },
  SET_SIZE(state, size) {
    state.size.current = size;
  },
  SET_COLOR(state, color) {
    state.palette.current = color;
  },
  ADD_COLOR(state, color) {
    state.palette.colors.push(color);
  }
};
