const fs = require('fs');
const readline = require('readline');

async function filterWords(filterFn) {
    const readInput = readline.createInterface({
        input: fs.createReadStream('swe_wordlist.txt'),
        crlfDelay: Infinity,
    });
  
    const words = [];
    for await (const word of readInput) {
      if (filterFn(word)) words.push(word);
    }

    console.log(`Filtered words count: ${words.length}`);
    fs.writeFileSync('../words0.js', JSON.stringify(words));
}

const validLetter = letter => 'abcdefghijklmnopqrtuvwxyzåäö'.includes(letter);
const validWord = word => [...word].every(validLetter);

//filterWords(word => word.length > 2 && word.length <= 5 && validWord(word));
filterWords(word => word.length > 2 && word.length <= 8 && validWord(word));
