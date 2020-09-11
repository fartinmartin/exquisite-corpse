export const getSections = {
  data: () => ({
    sections: {}
  }),
  methods: {
    async getSections(sections) {
      for (const [type, ref] of Object.entries(sections)) {
        this.sections[type] = await getSection(ref);
        this.sections[type].paths = Object.values(this.sections[type].drawing);
      }
    }
  }
};

async function getSection(docRef) {
  const response = await docRef.get();
  return { docId: response.id, ...response.data() };
}
