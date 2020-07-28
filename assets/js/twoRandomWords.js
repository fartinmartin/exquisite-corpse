export const twoRandomWords = async (fallback = "untitled") => {
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
    words = fallback;
  }

  return words;
};
