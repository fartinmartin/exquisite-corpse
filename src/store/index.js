import { createStore } from "vuex";

const state = {
  canvas: null,
  drawing: {
    currentPath: [],
    paths: [],
    history: { step: 0, paths: [] },
  },
  mouse: {
    x: 0,
    y: 0,
    isDrawing: false,
    mode: "draw",
    size: {
      current: 2,
      min: 1,
      max: 10,
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
        "#FDA1FF",
      ],
    },
  },
};

const getters = {
  getMode(state) {
    return state.mouse.mode;
  },
  getSize(state) {
    return {
      current: state.mouse.size.current,
      min: state.mouse.size.min,
      max: state.mouse.size.max,
    };
  },
  getCurrentPath(state) {
    return state.drawing.currentPath;
  },
};

const actions = {
  // canvas
  setCanvas({ commit }, canvas) {
    commit("SET_CANVAS", canvas);
  },

  // tool _ mode
  setMode({ commit }, mode) {
    typeof mode === "string"
      ? commit("SET_MODE", mode)
      : mode.target.value === "draw"
      ? commit("SET_MODE", "draw")
      : mode.target.value === "erase"
      ? commit("SET_MODE", "erase")
      : mode.target.value === "fill"
      ? commit("SET_MODE", "fill")
      : null;
  },

  // tool _ size
  incrementSize({ commit, getters }) {
    getters.getSize.current < getters.getSize.max && commit("INCREMENT_SIZE");
  },

  decrementSize({ commit, getters }) {
    getters.getSize.current > getters.getSize.min && commit("DECREMENT_SIZE");
  },

  // canvas _ history
  undoCanvas({ commit }) {
    commit("UNDO_CANVAS");
  },

  redoCanvas({ commit }) {
    commit("REDO_CANVAS");
  },

  // isDrawing
  setIsDrawing({ commit }, isDrawing) {
    commit("SET_IS_DRAWING", isDrawing);
  },

  pushPointDataToCurrentPath({ commit }, pathData) {
    commit("PUSH_POINT_DATA_TO_CURRENT_PATH", pathData);
  },

  pushCurrentPathToDrawing({ commit, getters }) {
    commit("PUSH_CURRENT_PATH_TO_DRAWING", getters.getCurrentPath);
  },

  setMouseXY({ commit }, mouseXY) {
    commit("SET_MOUSE_XY", mouseXY);
  },
};

const mutations = {
  SET_CANVAS(state, canvas) {
    state.canvas = canvas;
  },

  SET_MODE(state, mode) {
    state.mouse.mode = mode;
  },

  INCREMENT_SIZE(state) {
    state.mouse.size.current++;
  },

  DECREMENT_SIZE(state) {
    state.mouse.size.current--;
  },

  UNDO_CANVAS(state) {
    state.drawing.history.step--;
    state.drawing.paths.length = state.drawing.history.step;
    // clearCanvas
    // makeDrawing() with current state.drawing.paths
    console.log("undo", state.drawing.history.step);
  },

  REDO_CANVAS(state) {
    console.log("redo", state.drawing.history.step);
  },

  SET_IS_DRAWING(state, isDrawing) {
    state.mouse.isDrawing = isDrawing;
  },

  PUSH_POINT_DATA_TO_CURRENT_PATH(state, pointData) {
    state.drawing.currentPath.push(pointData);
  },

  PUSH_CURRENT_PATH_TO_DRAWING(state, currentPath) {
    state.drawing.paths.push(currentPath);
  },

  SET_MOUSE_XY(state, mouseXY) {
    state.mouse.x = mouseXY.x;
    state.mouse.y = mouseXY.y;
  },
};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
