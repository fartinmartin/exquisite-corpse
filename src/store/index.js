import { createStore } from "vuex";

const state = {
  canvas: {
    canvas: null,
    ctx: null,
  },
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
  getCanvasCtx: (state) => state.canvas.ctx,
  getMode: (state) => state.mouse.mode,
  getHistory: (state) => state.drawing.history,
  getSize: (state) => state.mouse.size,
  getCurrentPath: (state) => state.drawing.currentPath,
  getDrawing: (state) => state.drawing.paths,
};

const actions = {
  // canvas
  setCanvasCtx({ commit }, ctx) {
    commit("SET_CANVAS_CTX", ctx);
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

  // tool _ color
  setColor({ commit }, color) {
    commit("SET_COLOR", color);
  },

  addColor({ commit }, color) {
    commit("ADD_COLOR", color);
  },

  // canvas _ history
  incrementHistory({ commit }) {
    commit("INCREMENT_HISTORY");
  },

  decrementHistory({ commit }) {
    commit("DECREMENT_HISTORY");
  },

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

  drawPath({ commit }, path) {
    commit("DRAW_PATH", path);
  },
};

const mutations = {
  SET_CANVAS_CTX(state, ctx) {
    state.canvas.ctx = ctx;
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

  SET_COLOR(state, color) {
    state.mouse.palette.current = color;
  },

  ADD_COLOR(state, color) {
    state.mouse.palette.colors.push(color);
  },

  INCREMENT_HISTORY(state) {
    state.drawing.history.step++;
  },

  DECREMENT_HISTORY(state) {
    state.drawing.history.step--;
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
    state.drawing.history.paths.push(currentPath);
    state.drawing.currentPath = [];
  },

  SET_MOUSE_XY(state, mouseXY) {
    state.mouse.x = mouseXY.x;
    state.mouse.y = mouseXY.y;
  },

  DRAW_PATH(state, { x1, y1, x2, y2, color, size, mode }) {
    let ctx = state.canvas.ctx;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();

    if (mode === "erase") {
      ctx.globalCompositeOperation = "source-over";
    }
  },
};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
