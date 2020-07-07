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
  // set state _ canvas
  setCanvasCtx({ commit }, ctx) {
    commit("SET_CANVAS_CTX", ctx);
  },

  // set state _ tool _ mode
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

  // set state _ isDrawing
  setIsDrawing({ commit }, isDrawing) {
    commit("SET_IS_DRAWING", isDrawing);
  },

  // set state _ mouse
  setMouseXY({ commit }, mouseXY) {
    commit("SET_MOUSE_XY", mouseXY);
  },

  // set state _ tool _ size
  incrementSize({ commit, getters }) {
    getters.getSize.current < getters.getSize.max && commit("INCREMENT_SIZE");
  },

  decrementSize({ commit, getters }) {
    getters.getSize.current > getters.getSize.min && commit("DECREMENT_SIZE");
  },

  // set state _ tool _ color
  setColor({ commit }, color) {
    commit("SET_COLOR", color);
  },

  addColor({ commit }, color) {
    commit("ADD_COLOR", color);
  },

  // set state _ history
  incrementHistory({ commit }) {
    commit("INCREMENT_HISTORY");
  },

  decrementHistory({ commit }) {
    commit("DECREMENT_HISTORY");
  },

  pushPointDataToCurrentPath({ commit }, pathData) {
    commit("PUSH_POINT_DATA_TO_CURRENT_PATH", pathData);
  },

  pushCurrentPathToDrawing({ commit, getters }) {
    commit("PUSH_CURRENT_PATH_TO_DRAWING", getters.getCurrentPath);
  },

  // canvas pixel stuff
  undoCanvas({ commit, dispatch, getters }) {
    if (getters.getHistory.step >= 0) {
      commit("DECREMENT_HISTORY");
      commit("SET_DRAWING_TO_HISTORY");
      dispatch("clearCanvas");
      dispatch("makeDrawing");
    }
  },

  redoCanvas({ commit }) {
    commit("REDO_CANVAS");
  },

  clearCanvas({ commit }, event) {
    if (event) {
      console.log(event);
      commit("INCREMENT_HISTORY");
      commit("PUSH_CLEAR_TO_HISTORY");
    }
    commit("CLEAR_CANVAS");
  },

  // draw
  makeDrawing({ commit, dispatch, getters }) {
    getters.getDrawing.forEach((path) => {
      if (Array.isArray(path)) {
        path.forEach((pointData) => {
          // console.log(pointData);
          pointData.mode === "fill"
            ? dispatch("drawFill", pointData)
            : dispatch("drawPath", pointData);
        });
      } else dispatch("clearCanvas");
    });
  },

  drawPath({ commit }, path) {
    commit("DRAW_PATH", path);
  },

  drawFill({ commit }, path) {
    console.log("drawFill");
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

  SET_DRAWING_TO_HISTORY(state) {
    state.drawing.paths.length = state.drawing.history.step;
  },

  PUSH_CLEAR_TO_HISTORY(state) {
    state.drawing.history.paths.push("clear");
  },

  CLEAR_CANVAS(state) {
    state.canvas.ctx.clearRect(
      0,
      0,
      state.canvas.ctx.canvas.width,
      state.canvas.ctx.canvas.height
    );
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
