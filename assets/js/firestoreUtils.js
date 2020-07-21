async function findCompletedsThatContainSpecificSections() {
  const completedsRef = this.$fireStore.collection("completed");
  const completedsRes = await completedsRef.get();

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
    "MbCvCmPu6CnJbc2FWNKv"
  ];

  const badCompletedList = [];

  completedsRes.forEach(doc => {
    if (badSectionsList.some(s => doc.data().sections.top.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCompletedList.push(doc.id);
    }
    if (badSectionsList.some(s => doc.data().sections.mid.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCompletedList.push(doc.id);
    }
    if (badSectionsList.some(s => doc.data().sections.bot.id.includes(s))) {
      // console.log(doc.id, doc.data().sections);
      badCompletedList.push(doc.id);
    }
  });

  console.log(badCompletedList);

  // then you can delete them! BE CAREFUL THO
  badCompletedList.forEach(badDoc => {
    completedsRef
      .doc(badDoc)
      .delete()
      .then(docRef => console.log("deleted", docRef))
      .catch(error => {
        console.error(error);
      });
  });
}
