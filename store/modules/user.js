export const state = () => ({
  id: null,
  displayName: "",
});

export const getters = {};

export const actions = {
  async signOut() {
    const style = [
      "display: inline-block;",
      "text-align: center",
      "font-family: 'Space Mono', monospace;",
      "font-size: 12px;",
      "word-spacing: 1px;",
      "padding: 1rem;",
      "margin: 20px auto 22px auto;",
      "border: 2px solid #fb9200;",
      "box-shadow: 2px 2px 0 0 #f44e3b;",
      "background: #ffffff;",
    ];

    this.$fireAuth
      .signOut()
      .then(() => {
        console.log("%c👋 signed out", style.join(""));
      })
      .catch((error) => {
        console.log("%c🚫 sign out error", style.join(""));
        console.error(error);
      });
  },
  async signInAnonymously({ commit, dispatch }) {
    this.$fireAuth.onAuthStateChanged((user) => {
      if (!user) {
        this.$fireAuth
          .signInAnonymously()
          .then(async (response) => {
            const displayName = await dispatch("twoRandomWords");
            await response.user.updateProfile({ displayName });
            commit("SET_USER", response.user);
            dispatch("welcomeUser");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        commit("SET_USER", user);
        dispatch("welcomeUser");
      }
    });
  },
  async twoRandomWords() {
    let words = "";

    const url = new URL("https://api.wordnik.com/v4/words.json/randomWords"),
      params = {
        hasDictionaryDef: true,
        includePartOfSpeech: "adjective,noun",
        maxCorpusCount: -1,
        minDictionaryCount: 1,
        maxDictionaryCount: -1,
        minLength: 5,
        maxLength: 8,
        limit: 2,
        api_key: process.env.WORDNIK_API_KEY,
      };

    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    try {
      const response = await fetch(url.href);
      const data = await response.json();
      const wordsArray = data.map((word) => word.word);
      words = wordsArray.join(" ").toLowerCase();
    } catch {
      words = "anonymous";
    }

    return words;
  },
  welcomeUser() {
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
    // state.name = user.displayName;
    state.name = user.displayName || `anonymous-${user.uid.substr(1, 4)}`;
    state.id = user.uid;
  },
};
