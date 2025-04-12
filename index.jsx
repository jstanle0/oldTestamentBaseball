//TODO Add testing suite for edge cases
import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Play } from "./play";
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

export const verseContext = React.createContext(null);

function Main() {
    const navigate = useNavigate()
    return <main>
    <h1>Welcome to Old Testament Baseball!</h1>
    <button className="btn-lrg" onClick={()=>navigate('/home')}>Play!</button>
    </main>
}

function Win() {
    const navigate = useNavigate()
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext)

    return <main>
        <p>You win!</p>
        <p>The verse was {`${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`}. Good job!</p>
        <div className="buttonContainer">
            <button className="btn-lrg" onClick={()=>navigate('/')}>Play again!</button>
        </div>
    </main>
}

function Lose() {
    const navigate = useNavigate()
    const {selectedVerse, setSelectedVerse} = React.useContext(verseContext)
    return <main>
        <p>You Lose!</p>
        <p>Word was {selectedVerse}. Better luck next time!</p>
        <div className="buttonContainer">
            <button className="btn-lrg" onClick={()=>navigate('/')}>Play again!</button>
        </div>
    </main>
}

function App() {
    const [selectedVerse, setSelectedVerse] = React.useState('');

    return <BrowserRouter>
        <header></header>
        <verseContext.Provider value={{selectedVerse: selectedVerse, setSelectedVerse: setSelectedVerse}}>
            <Routes>
                <Route path="/" element={<Main/>} exact/>
                <Route path="/home" element={<Play/>}/>
                <Route path="/win" element={<Win/>}/>
                <Route path="/lose" element={<Lose/>}/>
            </Routes>
        </verseContext.Provider>
        <footer></footer>
    </BrowserRouter>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>)