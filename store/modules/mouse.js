export const state = () => ({
  x: 0,
  y: 0,
  isDrawing: false,
  mode: "draw",
  size: {
    current: 5,
    min: 1,
    max: 10
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
      "#FDA1FF"
    ]
  }
});

export const getters = {};
export const actions = {};
export const mutations = {};
