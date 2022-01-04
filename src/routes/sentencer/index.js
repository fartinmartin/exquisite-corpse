import { adjectives as adj, excluded, nouns } from "$lib/dictionary";
import * as Sentencer from "sentencer";

const { _nouns, _adjectives: _adj } = Sentencer;

const nounList = [..._nouns, ...nouns].filter((w) => excluded.indexOf(w) < 0);
const adjectiveList = [..._adj, ...adj].filter((w) => excluded.indexOf(w) < 0);

Sentencer.configure({ nounList, adjectiveList });

const structures = [
  "{{ an_adjective }} {{ noun }}",
  "{{ adjective }} {{ noun }}",
  "{{ an_adjective }} {{ adjective }} {{ noun }}",
  "{{ a_noun }} with {{ an_adjective }} {{ noun }}",
  // "{{ adjective }} {{ adjective }} {{ noun }}",
];

export function get() {
  const structure = structures[Math.floor(Math.random() * structures.length)];
  const sentence = Sentencer.make(structure);
  return { body: { sentence, structure } };
}
