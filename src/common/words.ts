import { randInt } from "./random";

export class WordList {
    words: string[];

    constructor(words: string[]) {
        this.words = words;
    }

    random() {
        return this.words[randInt(this.words.length)];
    }

    subwords(word: string) {
        return this.words.filter(w => isSubword(word, w)).sort((a, b) => a.length - b.length);
    }
}

export function isSubword(word: string, subword: string) {
    if (word === subword) return false;
    const count: { [key: string]: number } = {}
    for (const l of word) {
        count[l] = (count[l] || 0) + 1;
    }
    for (const l of subword) {
        if (!count[l]--) return false;
    }
    return true;
}
