import { twoRandomWords } from "~/assets/js/randomWords";

export const state = () => ({
  id: null,
  name: "",
  logInAttempts: 3,
  isLoggedIn: false
});

export const getters = {};

export const actions = {
  async onEnter({ state, commit, dispatch }) {
    commit("DECREMENT_LOGIN_ATTEMPT");
    try {
      if (state.logInAttempts > 0) {
        await dispatch("signInAnonymously");
      }
    } catch {
      commit("SET_IS_LOGGED_IN", false);
      dispatch("onEnter");
    }
  },
  async signOut() {
    const errStyle = [
      ...style,
      "border: 2px solid #fb9200;",
      "box-shadow: 2px 2px 0 0 #f44e3b;"
    ];

    this.$fireAuth
      .signOut()
      .then(() => {
        console.log("%c👋 signed out", errStyle.join(""));
      })
      .catch(error => {
        console.log("%c🚫 sign out error", errStyle.join(""));
        console.error(error);
      });
  },
  async signInAnonymously({ commit, dispatch }) {
    this.$fireAuth.onAuthStateChanged(user => {
      if (!user) {
        dispatch("setIsLoading", true, { root: true });
        this.$fireAuth
          .signInAnonymously()
          .then(async response => {
            const displayName = await twoRandomWords("anonymous");
            await response.user.updateProfile({ displayName });
            await commit("SET_USER", response.user);
            await commit("SET_IS_LOGGED_IN", true);
            dispatch("setIsLoading", false, { root: true });
            dispatch("welcomeUser");
          })
          .catch(async error => {
            dispatch("setIsLoading", false, { root: true });
            await commit("SET_IS_LOGGED_IN", false);
            console.error(error);
          });
      } else {
        commit("SET_USER", user);
        commit("SET_IS_LOGGED_IN", true);
        dispatch("welcomeUser");
      }
    });
  },
  welcomeUser() {
    console.log(
      `%c🎨 welcome ${this.$fireAuth.currentUser.displayName ||
        this.$fireAuth.currentUser.id}!`,
      style.join("")
    );
  },
  updateUserName({ commit }, displayName) {
    this.$fireAuth.currentUser
      .updateProfile({ displayName })
      .then(() => commit("SET_USER_NAME", displayName))
      .catch(error => console.error(error));
  }
};

export const mutations = {
  SET_USER_NAME(state, displayName) {
    state.name = displayName;
  },
  SET_USER(state, user) {
    state.name = user.displayName || `anonymous-${user.uid.substr(1, 4)}`;
    state.id = user.uid;
  },
  DECREMENT_LOGIN_ATTEMPT(state) {
    state.logInAttempts--;
  },
  SET_IS_LOGGED_IN(state, bool) {
    state.isLoggedIn = bool;
  }
};

const style = [
  "display: inline-block;",
  "text-align: center",
  "font-family: 'Space Mono', monospace;",
  "font-size: 12px;",
  "word-spacing: 1px;",
  "padding: 1rem;",
  "margin: 20px auto 22px auto;",
  "border: 2px solid #fcda00;",
  "box-shadow: 2px 2px 0 0 #fb9200;",
  "background: #ffffff;"
];
