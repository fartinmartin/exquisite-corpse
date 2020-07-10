export const state = () => ({
  type: "",
  currentPath: [],
  paths: [],
  history: { step: 0, paths: [] }
});

export const getters = {
  isDrawingEmpty(state) {
    return (
      !state.paths.length ||
      state.history.paths[state.history.step - 1] === "clear" ||
      false
    );
  },
  weAreBackInTime(state) {
    return state.history.step < state.history.paths.length;
  }
};

export const actions = {
  incrementHistory({ commit }) {
    commit("INCREMENT_HISTORY");
  },
  decrementHistory({ commit }) {
    commit("DECREMENT_HISTORY");
  },
  drawPath({ rootState, dispatch, commit }, event) {
    const pointData = {
      mode: rootState.mouse.mode,
      x1: rootState.mouse.x,
      y1: rootState.mouse.y,
      x2: event.offsetX,
      y2: event.offsetY,
      color: rootState.mouse.palette.current,
      size: rootState.mouse.size.current
    };
    // commit("PUSH_POINT_DATA_TO_CURRENT_PATH", pointData);
    // commit("DRAW_PATH", pointData);
    dispatch(
      "modules/mouse/setMousePosition",
      { x: event.offsetX, y: event.offsetY },
      { root: true }
    );
  },
  drawFill({ rootState, dispatch, commit }, event) {
    console.log("drawFill action", event);
  },
  pushCurrentPathToDrawingAndHistory({ commit, state }) {
    console.log("pushCurrentPathToDrawingAndHistory action");
    console.log("🚨this data should be shaped the same as fills & clears");
    // commit("PUSH_CURRENT_PATH_TO_DRAWING", state.currentPath);
    // commit("PUSH_CURRENT_PATH_TO_HISTORY", state.currentPath);
    // commit("CLEAR_CURRENT_PATH");
  },
  pushFillToDrawingAndHistory({ commit, state }) {
    console.log("pushCurrentPathToDrawingAndHistory action");
    console.log("🚨this data should be shaped the same as paths & clears");
    // commit("PUSH_FILL_TO_DRAWING", fill);
    // commit("PUSH_FILL_TO_HISTORY", fill);
  },
  ifWeAreBackInTimeOverwriteHistory({ commit, getters }) {
    if (getters.weAreBackInTime) {
      console.log("ifWeAreBackInTimeOverwriteHistory action");
      // commit("OVERWRITE_HISTORY");
    }
  }
};

export const mutations = {
  INCREMENT_HISTORY(state) {
    state.history.step++;
  },
  DECREMENT_HISTORY(state) {
    state.history.step--;
  }
};
