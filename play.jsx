import React from "react";
import { useNavigate } from "react-router-dom";
import { verseContext } from ".";
import { books } from './bibleList.json';

export function Play() {
    const navigate = useNavigate();
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext);
    const [guessedCharacters, setGuessedCharacters] = React.useState([]);
    const [currentGuess, setCurrentGuess] = React.useState('');
    const [displayError, setDisplayError] = React.useState('');
    const [incorrectGuesses, setIncorrectGuesses] = React.useState([]);
    const [hintVerses, setHintVerses] = React.useState([]);
    const [displayedHints, setDisplayedHints] = React.useState([]);

    const getRandomVerse = async ()=>{
        //Fetch a random verse from api.
        const response = await fetch(`https://bible-api.com/data/kjv/random/OT`);
        if (response.ok) {
            const body = await response.json();
            setSelectedVerse(body.random_verse)
        }
    }
    React.useEffect(()=>{
        getRandomVerse()
    }, [])

    //Old copied code, TODO remove
    function renderWord() {
        //Display guessed characters, with unguessed characters as "_", checks win condition
        //TODO more efficent rendering function that requires less iteration
        let renderedWord = [];
        let wordFinished = true;
        for (const character of selectedWord) {
            if (guessedCharacters.includes(character)) {
                renderedWord.push(character + " ");
            } else {
                renderedWord.push("_ ");
                wordFinished = false;
            }
        };
        if (!renderedWord) {
            return "Loading..."
        }
        if (wordFinished) {
            navigate('/win')
        }
        return renderedWord;
    }

    function renderIncorrectGuesses() {
        //Renders incorrect guessed characters
        let renderedGuesses = ''
        for (const character of incorrectGuesses) {
            renderedGuesses += character + " "
        }
        return renderedGuesses
    }

    function guessLetter(e) {
        //Recives user input, parses if it is valid
        e.preventDefault();
        if (/^[A-Z]$/.test(currentGuess)) {
            parseLetter(currentGuess.toLowerCase())
        } else if (/^[a-z]$/.test(currentGuess)) {
            parseLetter(currentGuess)
        } else {
            setDisplayError("Only single letters accepted.")
        }
    }

    function parseLetter(letter) {
        //Processes letter that has been guessed. Sets lose condition.
        if (guessedCharacters.includes(letter)) {
            setDisplayError("This letter is already guessed.");
            return
        }
        guessedCharacters.push(letter);
        if (!selectedWord.includes(letter)) {
            incorrectGuesses.push(letter);
            if (incorrectGuesses.length > 7) {
                navigate('/lose')
            } 
        }
        setCurrentGuess('');
        setDisplayError('');
    }

    //Start actual code
    async function addHint() {
        let currentVerse;
        if (!hintVerses.length==0) {
            currentVerse = hintVerses.at(-1);
        } else {
            currentVerse = selectedVerse;
        }
        const response = await fetch(`https://bible-api.com/${currentVerse.book_id} ${currentVerse.chapter}:${currentVerse.verse + 1}?translation=kjv`);
        if (response.ok) {
            const body = await response.json();
            return body.verses[0];
        } else {
            return {verse: 0, text: 'End of chapter'};
        }

    }
    function displayHintVerses() {
        const verses = [];
        for (const verse of hintVerses) {
            verses.push(<p key={verse.verse}>{verse.text}</p>)
        }
        return verses
    }
    function displayBooks() {
        const bookNames = [];
        for (const book of books) { 
            bookNames.push(<span key={book.id}>
            <input type="radio" className="btn-check" name="options-outlined" id={book.id} autoComplete="off"/>
            <label className="btn btn-outline-danger" htmlFor={book.id}>{book.name}</label>
            </span>)
        }
        return bookNames
    }

    return <main>
        <h1>Where is this verse?</h1>
        <p>{selectedVerse.text}</p>
        {displayHintVerses()}
        <button onClick={async ()=>setHintVerses([...hintVerses, await addHint()])}>Reveal next verse</button>
        <div className="form-check">{displayBooks()}</div>
    </main>
}