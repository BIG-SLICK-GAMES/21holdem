import React, { useEffect, useRef, useState } from 'react';
import splashVideo from '../../assets/videos/lobby-splash-grok.mp4';

export default function VideoSplash({ onComplete }) {
    const [started, setStarted] = useState(false);
    const finish = useRef(onComplete);
    useEffect(() => { finish.current = onComplete; }, [onComplete]);
    useEffect(() => {
        const timer = window.setTimeout(() => finish.current(), started ? 4000 : 10000);
        return () => window.clearTimeout(timer);
    }, [started]);
    return (
        <div className={`lobby-video-splash${started ? ' is-playing' : ''}`}>
            <video src={`${splashVideo}#t=0,1`} muted playsInline preload='auto'
                aria-label='21 Holdem welcome'
                onLoadedData={(event) => {
                    const video = event.currentTarget;
                    video.defaultPlaybackRate = 0.25;
                    video.playbackRate = 0.25;
                    video.currentTime = 0;
                    video.play().catch(() => finish.current());
                }}
                onPlaying={() => setStarted(true)}
                onTimeUpdate={(event) => {
                    if (event.currentTarget.currentTime >= 1) event.currentTarget.pause();
                }}
                onError={() => finish.current()} />
        </div>
    );
}
