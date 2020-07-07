const state = {
  canvas: null,
  drawing: {
    currentPath: [],
    paths: [],
    history: { step: 0, drawing: [] },
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

const getters = {};

const actions = {
  // canvas
  selectCanvasElement({ commit }, canvas) {
    commit("setCanvas", canvas);
  },
};

const mutations = {
  SET_CANVAS(state, canvas) {
    state.canvas = canvas;
  },

  decrementSize(state) {
    state.mouse.size.current > state.mouse.size.min
      ? state.mouse.size.current--
      : state.mouse.size.current;
  },

  incrementSize(state) {
    state.mouse.size.current < state.mouse.size.max
      ? state.mouse.size.current++
      : state.mouse.size.current;
  },
};

export default { state, getters, actions, mutations };
