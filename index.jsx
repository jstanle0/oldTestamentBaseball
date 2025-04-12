//TODO Add testing suite for edge cases
import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { Play } from "./play";
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

export const verseContext = React.createContext(null);
export const hintContext = React.createContext(null);

function Main() {
    const navigate = useNavigate();
    const {hintNumber, setHintNumber} = React.useContext(hintContext)
    return <main>
    <h1 className="text-light text-center">Welcome to Old Testament Baseball!</h1>
    <p className="text-light fs-3">Select number of strikes:</p>
    <div className="form-floating">
        <input type="range" className="form-range" id="hintInput" value={hintNumber} onChange={(e)=>{setHintNumber(e.target.value)}} min='2' max='9'></input> 
        <label htmlFor="hintInput" className="form-label text-light">{hintNumber}</label>
    </div>
    <div className="d-inline-flex gap-3">
        <button className="btn btn-outline-success btn-lg" onClick={()=>navigate('/home')}>Play!</button>
        <button className="btn btn-outline-warning btn-lg" onClick={()=>navigate('/help')}>Instructions</button>
    </div>
    </main>
}

function Win() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext);

    const completion = searchParams.get('complete');
    let message;
    if (completion == 'verse') {
        message = "Good job! You got it exactly right."
    } else if (completion == 'chapter') {
        message = "You got really close! Nice work."
    } else if (completion == 'book') {
        message = "Great start! Keep on trying."
    }

    return <main>
        <p className="text-light fs-3">{message}</p>
        <p className="text-light fs-3">The verse was {`${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`}.</p>
        <div className="buttonContainer">
            <button className="btn btn-outline-secondary btn-lg" onClick={()=>navigate('/')}>Play again!</button>
        </div>
    </main>
}

function Lose() {
    const navigate = useNavigate()
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext)
    return <main>
        <p className="text-light fs-3">Better luck next time!</p>
        <p className="text-light fs-3">The verse was {`${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`}.</p>
        <div className="buttonContainer">
            <button className="btn btn-outline-secondary btn-lg" onClick={()=>navigate('/')}>Play again!</button>
        </div>
    </main>
}

function Help() {
    const navigate = useNavigate()
    return <main>
        <h1 className="text-light text-center">Instructions:</h1>
        <p className="text-light fs-5 text-center text-wrap">The goal of the game is to guess the book, chapter, and verse of a random scripture in the Old Testament. You have a limited number of guesses, or "strikes", that you can choose on the starting screen. The guesses are made step by step, first with the book, then chapter, then verse. Simply click on the option you'd like to choose that select the blue button at the bottom right to enter your guess. You also can reveal the next verse by clicking the "reveal next verse" button, but it will give you a strike. Good luck!</p>
        <button className="btn btn-outline-secondary btn-lg" onClick={()=>navigate('/')}>Back</button>
    </main>
}

function App() {
    const [selectedVerse, setSelectedVerse] = React.useState('');
    const [hintNumber, setHintNumber] = React.useState(3);

    return <BrowserRouter>
        <header></header>
        <verseContext.Provider value={{selectedVerse: selectedVerse, setSelectedVerse: setSelectedVerse}}>
            <hintContext.Provider value={{hintNumber:hintNumber, setHintNumber:setHintNumber}}>
                <Routes>
                    <Route path="/" element={<Main/>} exact/>
                    <Route path="/home" element={<Play/>}/>
                    <Route path="/win" element={<Win/>}/>
                    <Route path="/lose" element={<Lose/>}/>
                    <Route path="/help" element={<Help />}/>
                </Routes>
            </hintContext.Provider>
        </verseContext.Provider>
        <footer></footer>
    </BrowserRouter>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>)