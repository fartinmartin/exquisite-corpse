import { twoRandomWords } from "~/assets/js/twoRandomWords";

export const state = () => ({
  id: null,
  displayName: "",
});

export const getters = {};

export const actions = {
  async signOut() {
    const errStyle = [
      ...style,
      "border: 2px solid #fb9200;",
      "box-shadow: 2px 2px 0 0 #f44e3b;",
    ];

    this.$fireAuth
      .signOut()
      .then(() => {
        console.log("%c👋 signed out", errStyle.join(""));
      })
      .catch((error) => {
        console.log("%c🚫 sign out error", errStyle.join(""));
        console.error(error);
      });
  },
  async signInAnonymously({ commit, dispatch }) {
    this.$fireAuth.onAuthStateChanged((user) => {
      if (!user) {
        this.$fireAuth
          .signInAnonymously()
          .then(async (response) => {
            const displayName = await twoRandomWords("anonymous");
            await response.user.updateProfile({ displayName });
            commit("SET_USER", response.user);
            dispatch("welcomeUser");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        commit("SET_USER", user);
        // dispatch("welcomeUser");
      }
    });
  },
  welcomeUser() {
    console.log(
      `%c🎨 welcome ${
        this.$fireAuth.currentUser.displayName || this.$fireAuth.currentUser.id
      }!`,
      style.join("")
    );
  },
};

export const mutations = {
  SET_USER(state, user) {
    state.name = user.displayName || `anonymous-${user.uid.substr(1, 4)}`;
    state.id = user.uid;
  },
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
  "background: #ffffff;",
];
