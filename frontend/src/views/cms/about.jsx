import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import aboutVoiceover from '../../assets/sounds/21_Holdem_about.mp3';

const highlights = [
    {
        title: 'Shared Board Pressure',
        body: 'Every community card affects everyone still in the hand, so each reveal can improve or damage your total.',
    },
    {
        title: 'Blackjack Decisions With Poker Tension',
        body: 'Call, raise, stand and double down all carry different levels of risk depending on your stack and the table state.',
    },
    {
        title: 'Short, Readable Rounds',
        body: 'The format is easy to follow for new players while still giving experienced players room to pressure the table.',
    },
];

const About = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = new Audio(aboutVoiceover);
        audioRef.current = audio;

        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const handleListenToggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        try {
            audio.currentTime = 0;
            await audio.play();
            setIsPlaying(true);
        } catch (_error) {
            setIsPlaying(false);
        }
    };

    return (
        <div className='cms-page about-page'>
            <div className="cms-header">About 21 Hold&apos;em</div>
            <div className="cms-content">
                <div className="about-hero">
                    <div className="about-hero-copy">
                        <p className="content-title">A fast table game that blends blackjack instincts with poker table pressure.</p>
                        <p>
                            21 Hold&apos;em is built around shared community cards, visible betting pressure, and risk decisions that stay readable for new players.
                            You are not just chasing a number. You are managing position, table momentum, and when to protect or attack your total.
                        </p>
                        <p>
                            The goal is simple: make the strongest total you can without losing control of the hand. The interesting part is how you get there.
                        </p>
                        <button
                            type="button"
                            className={`about-audio-button ${isPlaying ? 'is-playing' : ''}`}
                            onClick={handleListenToggle}
                            aria-pressed={isPlaying}
                        >
                            <span className="about-audio-icon" aria-hidden="true">
                                {isPlaying ? '||' : '>'}
                            </span>
                            <span className="about-audio-copy">
                                {isPlaying ? 'Stop Audio' : 'Listen'}
                            </span>
                        </button>
                    </div>
                    <div className="about-cta-card">
                        <div className="about-cta-label">Ready for the table</div>
                        <h3>Play with your BSG account</h3>
                        <p>
                            Sign in or create an account to enter the lobby, manage your chips, and play 21 Hold&apos;em.
                        </p>
                        <div className="about-actions">
                            <Link to="/login" className="about-action primary">Sign In</Link>
                            <Link to="/register" className="about-action secondary">Create Account</Link>
                        </div>
                    </div>
                </div>

                <div className="about-highlight-grid">
                    {highlights.map((item) => (
                        <div key={item.title} className="about-highlight-card">
                            <h3>{item.title}</h3>
                            <p>{item.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default About
