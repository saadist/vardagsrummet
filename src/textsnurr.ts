import { shuffleArray } from "./common/random";
import { createElement, SoundPlayer, updateElement } from "./common/elements";
import { WordList } from "./common/words";
import swedishWords3to8 from "./generated/swedishWords3to8";
import { SAOL } from "./common/saol";

type GameState = 'failed' | 'started' | 'cleared' | 'clearedAll';
const data = {
    round: 0,
    score: 0,
    hiscore: 0,
    secretWord: '',
    otherWords: [] as string[],
    revealedWords: [] as string[],
    state: 'failed' as GameState,
}

function validatedData(obj: any): typeof data {
    if (typeof obj !== 'object') throw 'data must be an object';
    if (typeof obj.round !== 'number') throw 'round must be a number';
    if (typeof obj.score !== 'number') throw 'score must be a number';
    if (typeof obj.hiscore !== 'number') throw 'hiscore must be a number';
    if (typeof obj.secretWord !== 'string') throw 'secretWord must be a string';
    if (!Array.isArray(obj.otherWords)) throw 'otherWords must be an array';
    if (!Array.isArray(obj.revealedWords)) throw 'revealedWords must be an array';
    if (typeof obj.state !== 'string') throw 'secretWord must be a string';
    return obj as typeof data;
}

let lastGuessButtons: NodeListOf<HTMLButtonElement> | null = null;

const view = {
    header: document.querySelector('header')!,
    round: document.getElementById('round')!,
    score: document.getElementById('score')!,
    hiscore: document.getElementById('hiscore')!,
    wordsPanel: document.getElementById('words-panel')!,
    wordOutput: document.getElementById('word-output')!,
    wordInput: document.getElementById('word-input')!,
    nextButton: document.getElementById('next-button') as HTMLButtonElement,
    submitButton: document.getElementById('submit-button') as HTMLButtonElement,
    eraseButton: document.getElementById('erase-button') as HTMLButtonElement,
    wordDialog: document.getElementById('word-dialog') as HTMLDialogElement,
    wordDialogClose: document.getElementById('word-dialog-close') as HTMLButtonElement,
}

const playCorrectSound = SoundPlayer("correct.mp3");
const playWinnerSound = SoundPlayer("winner.mp3");

const wordlist = new WordList(swedishWords3to8);

//////////////////////
// HELPERS

const isValidSecretWord = (word: string) => word.length > 3 && /^[a-zåäö]+$/.test(word);
const getHiddenWordElements = () => view.wordsPanel.querySelectorAll('.hidden');
const findHiddenWordElement = (word: string) => view.wordsPanel.querySelector(`.hidden[data-id="${word}"]`);
const findEmptyChild = (el: HTMLElement) => el.querySelector('div:empty');
const findInputLetter = (letter: string) => view.wordInput.querySelector<HTMLButtonElement>(`button[data-id="${letter}"]`);
const getOutputLetters = () => view.wordOutput.querySelectorAll("button");
const getLastOutputLetter = () => [...getOutputLetters()].at(-1) || null;
const toWord = (elements: NodeListOf<HTMLButtonElement>) => [...elements].reduce((word, el) => word + el.textContent, '');
const parseLink = (link: string) => {
    const word = link[0] == ':' ? link.slice(1).toLocaleLowerCase() : atob(link).toLocaleLowerCase();
    if (!isValidSecretWord(word)) throw 'bad word in link'
    return word;
}

//////////////////////
// RENDER AND UPDATE DOM

function renderAll() {
    renderHeader();
    renderPanel();
    renderNextButton();
}

function renderHeader() {
    const { header, round, score, hiscore, nextButton } = view;

    if (data.round > 0) {
        header.classList.remove('hidden');
        round.textContent = String(data.round);
        score.textContent = String(data.score);
        hiscore.textContent = String(data.hiscore);
    } else {
        header.classList.add('hidden');
    }
}

function renderNextButton() {
    const updateNextButton = updateElement.bind(null, view.nextButton);
    switch (data.state) {
        case 'started':
            updateNextButton({ className: 'warning', textContent: "Ge upp", onclick: endRound });
            break;
        case 'clearedAll':
            updateNextButton({ className: 'success', textContent: "Nästa", onclick: nextRound });
            break;
        case 'cleared':
            updateNextButton({ className: 'success', textContent: "Klara", onclick: endRound });
            break;
        default:
            updateNextButton({ className: 'warning', textContent: "Nästa", onclick: nextRound });
            break;
    }
}

function renderPanel() {
    const { secretWord, otherWords, revealedWords } = data;
    const { wordsPanel, wordInput, wordOutput } = view;

    wordsPanel.innerHTML = '';
    wordInput.innerHTML = '';
    wordOutput.innerHTML = '';

    for (const word of [...otherWords, secretWord]) {
        wordsPanel.appendChild(createElement('div', {
            className: ((secretWord === word) ? 'secret word' : 'word') + (revealedWords.includes(word) ? ' reveal' : ' hidden'),
            innerHTML: word.split('').map(l => `<span>${l}</span>`).join(''),
            onclick: () => showWordDialog(word),
        })).dataset.id = word;
    }

    const letters = shuffleArray(secretWord.split(''));
    for (const letter of letters) {
        wordInput.appendChild(createElement('div', {
            className: 'square slot2',
            innerHTML: `<button data-id=${letter}>${letter}</button>`
        }));
        wordOutput.appendChild(createElement('div', {
            className: 'square slot1'
        }));
    }
}

//////////////////////
// EVENTS AND UPDATE DOM

function addLetter(button: Element | null) {
    if (button && button.tagName === 'BUTTON') {
        findEmptyChild(view.wordOutput)?.appendChild(button);
    }
}

function eraseLetter(button: Element | null) {
    if (button && button.tagName === 'BUTTON') {
        findEmptyChild(view.wordInput)?.appendChild(button);
    }
}

function revealWord(word: string) {
    const el = findHiddenWordElement(word);
    if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        el.classList.remove("hidden");
        el.classList.add("reveal");
    }
    return el;
}

function revealRemainingWords() {
    getHiddenWordElements().forEach(el => {
        el.classList.remove("hidden");
        el.classList.add("reveal", "failed");
    });
}

view.wordInput.addEventListener('click', ev => addLetter(ev.target as Element | null));
view.wordOutput.addEventListener('click', ev => eraseLetter(ev.target as Element | null));
view.eraseButton.addEventListener('click', () => eraseLetter(getLastOutputLetter()));
view.submitButton.addEventListener('click', () => submitWord());
view.nextButton.addEventListener('mousedown', ev => ev.preventDefault());
view.eraseButton.addEventListener('mousedown', ev => ev.preventDefault());
view.submitButton.addEventListener('mousedown', ev => ev.preventDefault());
view.wordDialogClose.addEventListener('click', () => view.wordDialog.close());
document.addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'Enter': submitWord(); return;
        case 'Backspace': eraseLetter(getLastOutputLetter()); return;
        default: addLetter(findInputLetter(key.toLocaleLowerCase()));
    }
});

async function showWordDialog(word: string) {
    if (!findHiddenWordElement(word)) {
        const main = view.wordDialog.querySelector('main')!;
        const res = await SAOL.lookup(word);
        main.innerHTML = res.length > 0 ? SAOL.toHTML(res) : '<p>Saknas i SAOL<p>'
        //main.innerHTML = res.length > 0 ? `${SAOL.toHTML(res)}<a tabIndex={-1} href="https://svenska.se/saol/?sok=${word}&exactMatch=true" target="_blank">Källa: SAOL</a>` : '<p>Saknas i saol<p>';
        view.wordDialog.showModal();
    }
}

//////////////////////
// CHANGE GAME STATE

function submitWord() {
    const buttons = getOutputLetters();
    const guess = toWord(buttons);
    if (guess) {
        buttons.forEach(eraseLetter);
        lastGuessButtons = buttons;
        if (revealWord(guess)) {
            scoreWord(guess);
        }
    } else {
        lastGuessButtons?.forEach(addLetter)
    }
}
 
function scoreWord(word: string) {
    const isSecret = word === data.secretWord;
    const isFinal = getHiddenWordElements().length == 0;
    let points = word.length * 10;
    let winner = false;
    if (isSecret) { points += 100; data.state = 'cleared'; winner = true; }
    if (isFinal) { points += 500; data.state = 'clearedAll'; winner = true; }
    data.score += points;
    if (data.score > data.hiscore) data.hiscore = data.score;
    data.revealedWords.push(word);
    localStorage.setItem('textsnurr', JSON.stringify(data));
    if (winner) {
        playWinnerSound();
    } else {
        playCorrectSound();
    }
    renderHeader();
    renderNextButton();
}

function nextRound() {
    data.state = 'started';
    data.round++;
    data.secretWord = "";
    data.otherWords = [];
    data.revealedWords = [];
    lastGuessButtons = null;
    while (data.otherWords.length < 8 || data.otherWords.length > 48) {
        data.secretWord = wordlist.random();
        data.otherWords = wordlist.subwords(data.secretWord);
    }
    localStorage.setItem('textsnurr', JSON.stringify(data));
    renderAll();
}

function endRound() {
    revealRemainingWords();
    if (data.state === 'cleared') {
        data.state = 'clearedAll';
    } else {
        data.state = 'failed';
        data.round = 0;
        data.score = 0;
    }
    localStorage.setItem('textsnurr', JSON.stringify(data));
    renderNextButton();
}

//////////////////////
// START THE GAME

let sharedLink = window.location.hash.slice(1);
try {
    if (sharedLink) {
        data.secretWord = parseLink(sharedLink);
        data.otherWords = wordlist.subwords(data.secretWord);
        data.state = 'started';
        renderAll();
    } else {
        const storedData = localStorage.getItem('textsnurr');
        if (!storedData) throw '';
        Object.assign(data, validatedData(JSON.parse(storedData)));
        switch (data.state) {
            case 'failed':
                data.round = 0;
                data.score = 0;
                // fall though
            case 'clearedAll':
                nextRound();
                break;
            default:
                renderAll();
        }
    }
} catch (e: any) {
    if (e) console.error(e.toString());
    if (sharedLink) window.location.hash = '';
    nextRound();
    //view.wordsPanel.append(createElement('p', { className: 'error', textContent: "Felaktig länk!" }));
}
