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
  getColors: (state) => state.mouse.palette.colors,
  getCurrentPath: (state) => state.drawing.currentPath,
  getDrawing: (state) => state.drawing.paths,
  weAreBackInTime: (state) =>
    state.drawing.history.step < state.drawing.history.paths.length,
  drawingIsEmpty: (state) =>
    !state.drawing.paths.length ||
    state.drawing.history.paths[state.drawing.history.step - 1] === "clear",
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

  addColor({ commit, getters, dispatch }, color) {
    getters.getColors.includes(color) ? null : commit("ADD_COLOR", color);
    dispatch("setColor", color);
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

  pushCurrentPathToDrawingAndHistory({ commit, getters }) {
    commit("PUSH_CURRENT_PATH_TO_DRAWING", getters.getCurrentPath);
    commit("PUSH_CURRENT_PATH_TO_HISTORY", getters.getCurrentPath);
    commit("CLEAR_CURRENT_PATH");
  },

  ifWeAreBackInTimeOverwriteHistory({ commit, getters }) {
    if (getters.weAreBackInTime) {
      commit("OVERWRITE_HISTORY");
    }
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

  redoCanvas({ commit, dispatch, getters }) {
    if (getters.weAreBackInTime) {
      commit("INCREMENT_HISTORY");
      commit("SET_DRAWING_TO_TRIMMED_HISTORY");
      dispatch("clearCanvas");
      dispatch("makeDrawing");
    }
  },

  clearCanvas({ commit, getters }, event) {
    if (getters.drawingIsEmpty) return;
    if (event) {
      getters.weAreBackInTime && commit("OVERWRITE_HISTORY");
      commit("INCREMENT_HISTORY");
      commit("PUSH_CLEAR_TO_DRAWING");
      commit("PUSH_CLEAR_TO_HISTORY");
    }
    commit("CLEAR_CANVAS");
  },

  // draw
  makeDrawing({ commit, dispatch, getters }) {
    let drawing = getters.getDrawing;

    if (!drawing.length) commit("CLEAR_CANVAS");

    drawing.forEach((path, i) => {
      // setTimeout(() => {
      //   console.log(path);
      if (path === "clear") commit("CLEAR_CANVAS");
      else if (Array.isArray(path)) {
        path.forEach((pointData) => {
          pointData.mode === "fill"
            ? dispatch("drawFill", pointData)
            : dispatch("drawPath", pointData);
        });
      } else dispatch("clearCanvas");
      // }, 500 * (i + 1));
    });
  },

  drawPath({ commit }, path) {
    commit("DRAW_PATH", path);
  },

  drawFill({ commit }, fill) {
    console.log("drawFill");
  },

  saveDrawing({ commit, getters }) {
    if (getters.drawingIsEmpty) return;
    console.log("saveDrawing");
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

  SET_DRAWING_TO_TRIMMED_HISTORY(state) {
    let newDrawing = [...state.drawing.history.paths];
    newDrawing.length = state.drawing.history.step;
    state.drawing.paths = newDrawing;
  },

  PUSH_CLEAR_TO_DRAWING(state) {
    state.drawing.paths.push("clear");
  },

  PUSH_CLEAR_TO_HISTORY(state) {
    state.drawing.history.paths.push("clear");
  },

  OVERWRITE_HISTORY(state) {
    let dif = state.drawing.history.paths.length - state.drawing.history.step;
    state.drawing.history.paths.length =
      state.drawing.history.paths.length - dif;
  },

  CLEAR_CANVAS(state) {
    state.canvas.ctx.clearRect(
      0,
      0,
      state.canvas.ctx.canvas.width,
      state.canvas.ctx.canvas.height
    );
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

  PUSH_CURRENT_PATH_TO_HISTORY(state, currentPath) {
    state.drawing.history.paths.push(currentPath);
  },

  CLEAR_CURRENT_PATH(state) {
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
