import floodFill from "~/assets/js/floodFill";

export const state = () => ({
  ctx: null,
  type: "",
  currentPath: [],
  paths: [],
  history: { step: 0, paths: [] }
});

export const getters = {
  isDrawingEmpty(state) {
    return !state.paths.length;
  },
  weAreBackInTime(state) {
    return state.history.step < state.history.paths.length;
  },
  historyDif(state) {
    return state.history.paths.length - state.history.step;
  }
};

export const actions = {
  setCtx({ commit }, ctx) {
    commit("SET_CTX", ctx);
  },

  incrementHistory({ commit }) {
    commit("INCREMENT_HISTORY");
  },

  decrementHistory({ commit }) {
    commit("DECREMENT_HISTORY");
  },

  undoCanvas({ commit, dispatch, state }) {
    if (state.history.step > 0) {
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
    if (getters.isDrawingEmpty) return;

    // if triggered by user we need to log it to history
    if (event) {
      getters.weAreBackInTime &&
        commit("OVERWRITE_HISTORY", getters.historyDif);
      commit("INCREMENT_HISTORY");
      commit("PUSH_CLEAR_TO_DRAWING");
      commit("PUSH_CLEAR_TO_HISTORY");
    }

    commit("CLEAR_CANVAS");
  },

  logPathToCurrentPath({ rootState, commit }, event) {
    const pointData = {
      mode: rootState.modules.mouse.mode,
      color: rootState.modules.mouse.palette.current,
      size: rootState.modules.mouse.size.current,
      x1: rootState.modules.mouse.x,
      y1: rootState.modules.mouse.y,
      x2: event.offsetX,
      y2: event.offsetY
    };
    commit("PUSH_POINT_DATA_TO_CURRENT_PATH", pointData);
  },

  pushCurrentPathToDrawingHistory({ state, getters, commit }) {
    if (getters.weAreBackInTime) {
      commit("OVERWRITE_HISTORY", getters.historyDif);
    }
    commit("PUSH_CURRENT_PATH_TO_DRAWING", state.currentPath);
    commit("PUSH_CURRENT_PATH_TO_HISTORY", state.currentPath);
    commit("CLEAR_CURRENT_PATH");
  },

  makeDrawing({ state: { paths }, dispatch }) {
    // if (!paths.length) dispatch("clearCanvas"); // not sure why this is here 🤔
    // paths.forEach(path => path.forEach(point => dispatch("handleDraw", point)));
    paths.forEach(path => {
      console.log(path);
      path.forEach(point => dispatch("handleDraw", point));
    });
  },

  handleDraw({ dispatch }, point) {
    switch (point.mode) {
      case "draw":
      case "erase":
        dispatch("drawPath", point);
        break;
      case "fill":
        dispatch("drawFill", point);
        break;
      case "clear":
        dispatch("clearCanvas");
        break;
      default:
        break;
    }
  },

  drawPath({ state: { ctx } }, point) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = point.color;
    ctx.lineWidth = point.size * 2;

    if (point.mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.moveTo(point.x1, point.y1);
    ctx.lineTo(point.x2, point.y2);
    ctx.stroke();
    ctx.closePath();

    if (point.mode === "erase") {
      ctx.globalCompositeOperation = "source-over";
    }
  },

  drawFill({ state: { ctx } }, point) {
    ctx.fillStyle = point.color;
    let tolerance = 100;
    floodFill.fill(point.x2, point.y2, tolerance, ctx);
  }
};

export const mutations = {
  SET_CTX(state, ctx) {
    state.ctx = ctx;
  },

  INCREMENT_HISTORY(state) {
    state.history.step++;
  },

  DECREMENT_HISTORY(state) {
    state.history.step--;
  },

  OVERWRITE_HISTORY(state, historyDif) {
    state.history.paths.length = state.history.paths.length - historyDif;
  },

  PUSH_POINT_DATA_TO_CURRENT_PATH(state, pointData) {
    state.currentPath.push(pointData);
  },

  PUSH_CURRENT_PATH_TO_DRAWING(state, currentPath) {
    state.paths.push(currentPath);
  },

  PUSH_CURRENT_PATH_TO_HISTORY(state, currentPath) {
    state.history.paths.push(currentPath);
  },

  CLEAR_CURRENT_PATH(state) {
    state.currentPath = [];
  },

  PUSH_CLEAR_TO_DRAWING(state) {
    state.paths.push([{ mode: "clear" }]);
  },

  PUSH_CLEAR_TO_HISTORY(state) {
    state.history.paths.push([{ mode: "clear" }]);
  },

  CLEAR_CANVAS(state) {
    state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
  },

  SET_DRAWING_TO_HISTORY(state) {
    state.paths.length = state.history.step;
  },

  SET_DRAWING_TO_TRIMMED_HISTORY(state) {
    let trim = [...state.history.paths];
    trim.length = state.history.step;
    state.paths = trim;
  }
};
