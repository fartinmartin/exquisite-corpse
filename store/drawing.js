import floodFill from "~/assets/js/floodFill";

export const state = () => ({
  canvas: null,
  ctx: null,
  type: null,
  currentPath: [],
  paths: [],
  mobilePaths: [],
  history: { step: 0, paths: [] },
  sections: {
    top: null,
    mid: null,
    bot: null
  },
  title: "",
  isSaving: "idle"
});

export const getters = {
  isDrawingEmpty({ paths, history: { step } }) {
    return !paths.length || paths[step - 1][0].mode === "clear";
  },
  weAreBackInTime(state) {
    return state.history.step < state.history.paths.length;
  },
  historyDif(state) {
    return state.history.paths.length - state.history.step;
  },
  cantUndo(state) {
    return state.history.step <= 0;
  },
  cantRedo(state) {
    return state.history.step >= state.history.paths.length;
  },
  mobileFactor(state) {
    return 1080 / state.canvas.width;
  },
  isMobile: () => process.client && window.innerWidth < 571,
  computedPaths(state, getters) {
    return getters.isMobile ? state.mobilePaths : state.paths;
  }
};

export const actions = {
  setIsSaving({ commit, dispatch }, saveState) {
    if (saveState === "saving") {
      dispatch("setIsLoading", true, { root: true });
    } else {
      dispatch("setIsLoading", false, { root: true });
    }
    commit("SET_IS_SAVING", saveState);
  },

  setTitle({ commit }, title) {
    commit("SET_TITLE", title);
  },

  setSections({ commit }, payload) {
    commit("SET_SECTIONS", payload);
  },

  clearDrawing({ commit }) {
    commit("CLEAR_DRAWING");
  },

  setCanvas({ commit }, canvas) {
    commit("SET_CANVAS", canvas);
  },

  setCtx({ commit }, ctx) {
    commit("SET_CTX", ctx);
  },

  setType({ commit }, type) {
    commit("SET_TYPE", type);
  },

  incrementHistory({ commit }) {
    commit("INCREMENT_HISTORY");
  },

  decrementHistory({ commit }) {
    commit("DECREMENT_HISTORY");
  },

  completePath({ dispatch }) {
    dispatch("mouse/setIsDrawing", false, { root: true });
    dispatch("pushCurrentPathToDrawingHistory");
    dispatch("incrementHistory");
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

  logPathToCurrentPath({ rootState, commit, getters }, event) {
    let pointData = {
      mode: rootState.mouse.mode,
      color: rootState.mouse.palette.current,
      size: rootState.mouse.size.current,
      x1: rootState.mouse.x,
      y1: rootState.mouse.y,
      x2: event.offsetX,
      y2: event.offsetY
    };
    if (process.client && window.innerWidth < 571)
      pointData.size = Math.round(pointData.size / getters.mobileFactor);
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

  makeDrawing({ state: { paths }, dispatch, commit }) {
    // handles undo scenarios that dont trigger undoCanvas() ? 🤔
    if (!paths.length) commit("CLEAR_CANVAS");

    paths.forEach(path => path.forEach(point => dispatch("handleDraw", point)));
  },

  handleDraw({ dispatch, commit }, point) {
    switch (point.mode) {
      case "draw":
      case "erase":
        if (point.x1 === point.x2 && point.y1 === point.y2) {
          dispatch("drawCircle", point);
        } else {
          dispatch("drawPath", point);
        }
        break;
      case "fill":
        dispatch("drawFill", point);
        break;
      case "clear":
        commit("CLEAR_CANVAS"); // 🤔
        break;
      default:
        break;
    }
  },

  drawCircle({ state: { ctx } }, point) {
    if (point.mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.arc(point.x1, point.y1, point.size, 0, 2 * Math.PI, true);
    ctx.fillStyle = point.color;
    ctx.fill();

    if (point.mode === "erase") {
      ctx.globalCompositeOperation = "source-over";
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
    let tolerance = 50;
    let dprPoint = {
      x2: point.x2 * devicePixelRatio,
      y2: point.y2 * devicePixelRatio
    };
    floodFill.fill(dprPoint.x2, dprPoint.y2, tolerance, ctx);
  },

  setMobilePaths({ state, getters, commit }) {
    const f = getters.mobileFactor;

    const newPaths = state.paths.map(path => {
      return path.map(point => {
        const newPoint = { ...point };

        newPoint.x1 = Math.round(newPoint.x1 * f);
        newPoint.x2 = Math.round(newPoint.x2 * f);
        newPoint.y1 = Math.round(newPoint.y1 * f);
        newPoint.y2 = Math.round(newPoint.y2 * f);
        newPoint.size = Math.round(newPoint.size * f);

        return newPoint;
      });
    });

    commit("SET_MOBILE_PATHS", newPaths);
  }
};

export const mutations = {
  SET_TITLE(state, title) {
    state.title = title;
  },

  CLEAR_DRAWING(state) {
    state.title = "";
    state.paths = [];
    state.history.paths = [];
    state.history.step = 0;
    state.currentPath = []; // probs unecessary but oh well
    state.type = null;
    state.isSaving = "idle";
  },

  SET_CANVAS(state, canvas) {
    state.canvas = canvas;
  },

  SET_CTX(state, ctx) {
    state.ctx = ctx;
  },

  SET_TYPE(state, type) {
    state.type = type;
  },

  SET_SECTIONS(state, payload) {
    state.sections[payload.type] = { ...payload };
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
  },

  SET_MOBILE_PATHS(state, mobilePaths) {
    state.mobilePaths = mobilePaths;
  },

  SET_IS_SAVING(state, saveState) {
    state.isSaving = saveState;
  }
};
