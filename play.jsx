import React from "react";
import { useNavigate } from "react-router-dom";
import { verseContext } from ".";
import { hintContext } from ".";
import { books } from './bibleBook.json';
import chapterVerse from './bibleChapterVerse.json';
import { NT } from './ntBooks.json';

export function Play() {
    const navigate = useNavigate();
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext);
    const {hintNumber, setHintNumber} = React.useContext(hintContext);
    const [displayError, setDisplayError] = React.useState('');
    const [incorrectGuesses, setIncorrectGuesses] = React.useState([]);
    const [hintVerses, setHintVerses] = React.useState([]);
    const [bookGuess, setBookGuess] = React.useState('');
    const [bookCorrect, setBookCorrect] = React.useState(false);
    const [chapterGuess, setChapterGuess] = React.useState(null);
    const [chapterCorrect, setChapterCorrect] = React.useState(false);
    const [verseGuess, setVerseGuess] = React.useState('');
    const [verseCorrect, setVerseCorrect] = React.useState(false);
    const [strikes, setStrikes] = React.useState(0);
    const [maxStrikes, setMaxStrikes] = React.useState(hintNumber);
    const [guessRange, setGuessRange] = React.useState([-1,999]);
    const [wrongBooks, setWrongBooks] = React.useState([]);

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

    React.useEffect(()=>{
        if (strikes >= maxStrikes) {
            if (bookCorrect && chapterCorrect) {
                navigate('/win?complete=chapter')
            } else if (bookCorrect) {
                navigate('/win?complete=book')
            } else {
                navigate('/lose')
            }
        }
    }, [strikes])

    async function addHint() {
        setStrikes(strikes+1)
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
                setFunc();
                setDisplayError('');
                setGuessRange([-1,999]);
            } else {
                setStrikes(strikes + 1);
                let type = typeof guess
                if (type == "number") {
                    if (guess > selectedVerse[valueType]) {
                        setDisplayError("Too high!")
                        setGuessRange([guessRange[0], guess-1])
                    } else {
                        setDisplayError("Too low!")
                        setGuessRange([guess-1, guessRange[1]])
                    }
                } else {
                    setWrongBooks([...wrongBooks, guess])
                }
            }
        }
    }

    function displayHintVerses() {
        const verses = [];
        for (const verse of hintVerses) {
            verses.push(<p className="fs-3 fst-italic text-center" key={verse.verse}>{verse.text}</p>)
        }
        return verses
    }
    function displayBooks() {
        const bookNames = [];
        for (const book of books) { 
            bookNames.push(<span className="mt-3" style={{display: "inline-block"}} key={book.id}>
            <input type="radio" className="btn-check" name="book-form" id={book.id} value={book.name} autoComplete="off" onChange={(e)=>setBookGuess(e.target.value)} disabled={bookCorrect || wrongBooks.includes(book.name)}/>
            <label className={`btn btn-outline-${bookCorrect ? 'success': wrongBooks.includes(book.name) ? 'danger' : 'light'}`} htmlFor={book.id}>{book.name}</label>
            </span>)
        }
        return bookNames
    }
    function displayChapters() {
        const chapters = [];
        console.log(guessRange)
        const curBook = chapterVerse.find(book => book.book == selectedVerse.book);
        if (curBook) {
            for (let i = 0; i < curBook.chapters.length; i++) {
                chapters.push(<span className="mt-3" style={{display: "inline-block"}} key={'chapter' + (i + 1)}>
                    <input type="radio" className="btn-check" name="chapter-form" id={'chapter' + (i + 1)} value={i + 1} autoComplete="off" onChange={(e)=>setChapterGuess(e.target.value)} disabled={chapterCorrect || !(guessRange[0] < i  && i < guessRange[1])}/>
                    <label className={`btn btn-outline-${chapterCorrect ? 'success': !(guessRange[0] < i  && i < guessRange[1]) ? 'warning' : 'light'}`} htmlFor={'chapter' + (i + 1)}>{i + 1}</label>
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
                    chapters.push(<span className="mt-3" style={{display: "inline-block"}} key={'verse' + (i + 1)}>
                        <input type="radio" className="btn-check" name="verse-form" id={'verse' + (i + 1)} value={i + 1} autoComplete="off" onChange={(e)=>setVerseGuess(e.target.value)} disabled={verseCorrect || !(guessRange[0] < i  && i < guessRange[1])}/>
                        <label className={`btn btn-outline-${verseCorrect ? 'success': !(guessRange[0] < i  && i < guessRange[1]) ? 'warning' : 'light'}`} htmlFor={'verse' + (i + 1)}>{i + 1}</label>
                        </span>)
                }
            }
        }
        return chapters
    }

    function displayStrikes() {
        const displayedStrikes = []
        for (let i = 0; i < maxStrikes; i++) {
            if (i < strikes) {
                displayedStrikes.push(<span className="alert alert-danger" role="alert" key={'strike' + i}>X</span>);
            } else {
                displayedStrikes.push(<span className="alert alert-success" role="alert" key={'strike' + i}>O</span>);
            };
        };
        return displayedStrikes;
    }

    return <main>
        <h1 className="text-light fs-1">Where is this verse?</h1>
        <p className="fs-3 fst-italic text-center">{selectedVerse.text}</p>
        {displayHintVerses()}
        <button className='btn btn-outline-secondary btn-lg' onClick={async ()=>setHintVerses([...hintVerses, await addHint()])}>Reveal next verse</button>
        <div className="form-check" id='bookForm'>
            {displayBooks()}
            <button type="button" className="btn btn-outline-primary ms-3" onClick={() => handleSubmit(bookGuess, 'book', ()=>setBookCorrect(true))}>Guess Book</button>
        </div>
        <br/>
        {bookCorrect && <div className="form-check" id='chapterForm'>
            {displayChapters()}
            <button type="button" className="btn btn-outline-primary ms-3" onClick={()=>handleSubmit(Number(chapterGuess), 'chapter', ()=>setChapterCorrect(true))}>Guess Chapter</button>
        </div>}
        <br/>
        {chapterCorrect && <div className="form-check">
            {displayVerses()}
            <button type="button" className="btn btn-outline-primary ms-3" onClick={()=>handleSubmit(Number(verseGuess), 'verse', ()=>navigate('/win?complete=verse'))}>Guess Verse</button>
        </div>}
        <div>
            <p>{displayError}</p>
        </div>
        <div>
            <p className="fs-3 text-light">Strikes:</p>
            {displayStrikes()}
        </div>
    </main>
}