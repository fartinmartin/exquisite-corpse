import floodFill from "~/assets/js/floodFill";

export const state = () => ({
  canvas: null,
  ctx: null,
  type: null,
  currentPath: [],
  paths: [],
  history: { step: 0, paths: [] },
  sections: {
    top: null,
    mid: null,
    bot: null,
  },
  title: "",
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
};

export const actions = {
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
    dispatch("modules/mouse/setIsDrawing", false, { root: true });
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
    // TODO: it is confusing that I call the commit directly half the time
    //       ...I think it has to do with this getters check, as in ~20% of the
    //       ...instances in which I'm forced to call it directly fail this check
    //       ...what's going on there? this next line *does* seem necessary 🤔
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
      y2: event.offsetY,
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

  makeDrawing({ state: { paths }, dispatch, commit }) {
    // handles undo scenarios that dont trigger undoCanvas() ? 🤔
    if (!paths.length) commit("CLEAR_CANVAS");

    paths.forEach((path) =>
      path.forEach((point) => dispatch("handleDraw", point))
    );
  },

  handleDraw({ dispatch, commit }, point) {
    switch (point.mode) {
      case "draw":
      case "erase":
        dispatch("drawPath", point);
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
    let dpiPoint = {
      x2: point.x2 * devicePixelRatio,
      y2: point.y2 * devicePixelRatio,
    };
    floodFill.fill(dpiPoint.x2, dpiPoint.y2, tolerance, ctx);
  },
};

export const mutations = {
  SET_TITLE(state, title) {
    state.title = title;
  },

  CLEAR_DRAWING(state) {
    state.paths = [];
    state.history.paths = [];
    state.history.step = 0;
    state.currentPath = []; // probs unecessary but oh well
    state.type = null;
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
    if (payload.isTrue) {
      state.sections[payload.type] = { type, docId: "temp" }; // sets it to string so that Canvas component knows how to deal
    } else {
      state.sections[payload.type] = { ...payload };
    }
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
};
