import React from "react";
import { useNavigate } from "react-router-dom";
import { verseContext } from ".";
import { books } from './bibleBook.json';
import chapterVerse from './bibleChapterVerse.json';
import { NT } from './ntBooks.json';

export function Play() {
    const navigate = useNavigate();
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext);
    const [displayError, setDisplayError] = React.useState('');
    const [incorrectGuesses, setIncorrectGuesses] = React.useState([]);
    const [hintVerses, setHintVerses] = React.useState([]);
    const [bookGuess, setBookGuess] = React.useState('');
    const [bookCorrect, setBookCorrect] = React.useState(false);
    const [chapterGuess, setChapterGuess] = React.useState(null);
    const [chapterCorrect, setChapterCorrect] = React.useState(false);
    const [verseGuess, setVerseGuess] = React.useState('');
    const [verseCorrect, setVerseCorrect] = React.useState(false);

    const getRandomVerse = async ()=>{
        //Fetch a random verse from api.
        const response = await fetch(`https://bible-api.com/data/kjv/random/NT`);
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

    function handleSubmit(guess, valueType, setFunc) {
        if (guess) {
            if (guess == selectedVerse[valueType]) {
                setFunc(true)
            }
        }
    }
    function handleVerseSubmit(guess) {
        if (guess) {
            if (guess == selectedVerse['verse']) {
                navigate('/win')
            }
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
        for (const book of NT) { 
            bookNames.push(<span key={book.id}>
            <input type="radio" className="btn-check" name="book-form" id={book.id} value={book.name} autoComplete="off" onChange={(e)=>setBookGuess(e.target.value)} disabled={bookCorrect}/>
            <label className={`btn btn-outline-${bookCorrect ? 'success': 'light'}`} htmlFor={book.id}>{book.name}</label>
            </span>)
        }
        return bookNames
    }
    function displayChapters() {
        const chapters = [];
        const curBook = chapterVerse.find(book => book.book == selectedVerse.book);
        if (curBook) {
            for (let i = 0; i < curBook.chapters.length; i++) {
                chapters.push(<span key={'chapter' + (i + 1)}>
                    <input type="radio" className="btn-check" name="chapter-form" id={'chapter' + (i + 1)} value={i + 1} autoComplete="off" onChange={(e)=>setChapterGuess(e.target.value)} disabled={chapterCorrect}/>
                    <label className={`btn btn-outline-${chapterCorrect ? 'success': 'light'}`} htmlFor={'chapter' + (i + 1)}>{i + 1}</label>
                    </span>)
            }
        }
        return chapters
    }

    function displayVerses() {
        const chapters = [];
        const curBook = chapterVerse.find(book => book.book == selectedVerse.book);
        if (curBook) {
            const curChapter = curBook.chapters.find(chapter => Number(chapter.chapter) == selectedVerse.chapter);
            if (curChapter) {
                for (let i = 0; i < curChapter.verses; i++) {
                    chapters.push(<span key={'verse' + (i + 1)}>
                        <input type="radio" className="btn-check" name="verse-form" id={'verse' + (i + 1)} value={i + 1} autoComplete="off" onChange={(e)=>setVerseGuess(e.target.value)} disabled={verseCorrect}/>
                        <label className={`btn btn-outline-${verseCorrect ? 'success': 'light'}`} htmlFor={'verse' + (i + 1)}>{i + 1}</label>
                        </span>)
                }
            }
        }
        return chapters
    }

    return <main>
        <h1>Where is this verse?</h1>
        <p>{selectedVerse.text}</p>
        {displayHintVerses()}
        <button onClick={async ()=>setHintVerses([...hintVerses, await addHint()])}>Reveal next verse</button>
        <div className="form-check" id='bookForm'>
            {displayBooks()}
            <button type="button" className="btn btn-outline-light" onClick={() => handleSubmit(bookGuess, 'book', setBookCorrect)}>Guess Book</button>
        </div>
        <br/>
        {bookCorrect && <div className="form-check" id='chapterForm'>
            {displayChapters()}
            <button type="button" className="btn btn-outline-light" onClick={()=>handleSubmit(chapterGuess, 'chapter', setChapterCorrect)}>Guess Chapter</button>
        </div>}
        <br/>
        {chapterCorrect && <div className="form-check">
            {displayVerses()}
            <button type="button" className="btn btn-outline-light" onClick={()=>handleVerseSubmit(verseGuess)}>Guess Verse</button>
        </div>}
    </main>
}