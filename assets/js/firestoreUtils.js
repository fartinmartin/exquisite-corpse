// these aren't in use, this is just a notepad for ideas/functions
// see: ~/components/FirestoreAdminTools.vue for more things like this
async function findCorpsesThatContainSpecificSections() {
  const corpsesRef = this.$fireStore.collection("corpses");
  const corpsesRes = await corpsesRef.get();

  // edit this list to contain the sections you are searching for
  const badSectionsList = [
    "KkO0udJVa5mG491milNb",
    "Pswow8NPY4or8RT3s4c3",
    "t6MVN4PBbbWoHwu7lQn4",
    "EsytHA6XrK9zjHR8TTBN",
    "GMjmBsMOF9eEzvZqesfD",
    "Nirq4eZIPLdIKjhPAdEa",
    "Va3NOWiIFvMA0sSoUcpR",
    "X9QOaSvsTLqNQdA2h8yE",
    "g8QK0bbIqbyJq08lACbN",
    "r9XFppkMYDPTreuzMTFn",
    "vjN8zHNXnTRlHu0FS1DH",
    "zaKS5bFFLcFnkbw1Zy6f",
    "6fmUKXArK2HZrdjKLAMw",
    "MbCvCmPu6CnJbc2FWNKv",
  ];

  const badCorpseList = [];

  corpsesRes.forEach((doc) => {
    if (badSectionsList.some((s) => doc.data().sections.top.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCorpseList.push(doc.id);
    }
    if (badSectionsList.some((s) => doc.data().sections.mid.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCorpseList.push(doc.id);
    }
    if (badSectionsList.some((s) => doc.data().sections.bot.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCorpseList.push(doc.id);
    }
  });

  console.log(badCorpseList);

  // then you can delete them! BE CAREFUL THO
  badCorpseList.forEach((badDoc) => {
    corpsesRef
      .doc(badDoc)
      .delete()
      .then((docRef) => console.log("deleted", docRef))
      .catch((error) => {
        console.error(error);
      });
  });
}
