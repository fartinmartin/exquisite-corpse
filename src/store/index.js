import { createStore } from "vuex";
import floodFill from "../modules/floodFill";

const state = {
  user: {
    name: null,
    uid: null,
  },
  canvas: {
    canvas: null,
    ctx: null,
  },
  drawing: {
    currentPath: [],
    paths: [],
    history: { step: 0, paths: [] },
    guides: {
      hT: `${540 / 5}px`,
      tL: `${(540 / 5) * 2}px`,
    },
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
  getUser: (state) => state.user,
  getCanvasCtx: (state) => state.canvas.ctx,
  getMode: (state) => state.mouse.mode,
  getHistory: (state) => state.drawing.history,
  getSize: (state) => state.mouse.size,
  getColors: (state) => state.mouse.palette.colors,
  getCurrentColor: (state) => state.mouse.palette.current,
  getCurrentPath: (state) => state.drawing.currentPath,
  getDrawing: (state) => state.drawing.paths,
  getGuides: (state) => state.drawing.guides,
  getMouseXY: (state) => ({ x: state.mouse.x, y: state.mouse.y }),
  weAreBackInTime: (state) =>
    state.drawing.history.step < state.drawing.history.paths.length,
  drawingIsEmpty: (state) =>
    !state.drawing.paths.length ||
    state.drawing.history.paths[state.drawing.history.step - 1] === "clear",
};

const actions = {
  // set state _ user
  setUser({ commit }, user) {
    commit("SET_USER", user);
  },

  // set state _ canvas
  setCanvasCtx({ commit }, ctx) {
    commit("SET_CANVAS_CTX", ctx);
  },

  // set state _ tool _ mode
  setMode({ commit }, mode) {
    typeof mode === "string"
      ? commit("SET_MODE", mode)
      : commit("SET_MODE", mode.target.value);
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

  pushFilltoDrawingAndHistory({ commit, getters }) {
    let fill = {
      mode: "fill",
      x: getters.getMouseXY.x,
      y: getters.getMouseXY.y,
      color: getters.getCurrentColor,
    };
    commit("PUSH_FILL_TO_DRAWING", fill);
    commit("PUSH_FILL_TO_HISTORY", fill);
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
      else if (path.mode === "fill") {
        let e = {
          offsetX: path.x,
          offsetY: path.y,
        };
        dispatch("handleDrawFill", e);
      } else if (Array.isArray(path)) {
        path.forEach((pointData) => {
          dispatch("drawPath", pointData);
        });
      } else dispatch("clearCanvas");
      // }, 500 * (i + 1));
    });
  },

  drawPath({ commit }, path) {
    commit("DRAW_PATH", path);
  },

  handleDrawPath({ dispatch, getters }, event) {
    let pointData = {
      mode: getters.getMode,
      x1: getters.getMouseXY.x,
      y1: getters.getMouseXY.y,
      x2: event.offsetX,
      y2: event.offsetY,
      color: getters.getCurrentColor,
      size: getters.getSize.current,
    };
    dispatch("pushPointDataToCurrentPath", pointData);
    dispatch("drawPath", pointData);
    dispatch("setMouseXY", { x: event.offsetX, y: event.offsetY });
  },

  handleDrawFill({ getters }, event) {
    let ctx = getters.getCanvasCtx;
    let currentColor = getters.getCurrentColor;
    ctx.fillStyle = currentColor;
    let tolerance = 100;
    floodFill.fill(event.offsetX, event.offsetY, tolerance, ctx);
  },

  // guides
  setGuidePosition({ commit }, payload) {
    commit("SET_GUIDE_POSITION", payload);
  },
};

const mutations = {
  SET_USER(state, user) {
    if (user) {
      state.user.name = user.isAnonymous
        ? `anonymous-${user.uid.substr(1, 4)}`
        : user.displayName;
      state.user.uid = user.uid;
    }
  },

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

  PUSH_FILL_TO_DRAWING(state, fill) {
    state.drawing.paths.push(fill);
  },

  PUSH_FILL_TO_HISTORY(state, fill) {
    state.drawing.history.paths.push(fill);
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

  SET_GUIDE_POSITION(state, { id, y }) {
    state.drawing.guides[id] = y;
  },
};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
