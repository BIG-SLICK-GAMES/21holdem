import { useEffect, useState } from 'react';
import { GAME_BROWSER_EVENTS } from 'scripts/gameEvents';

const clips = require.context('../../../assets/sounds/tutorial', false, /\.mp3$/);
const narration = Object.fromEntries(clips.keys().map(key => [key.slice(2, -4), clips(key)]));

export default function useTutorialNarration(reading, active) {
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const preference = event => {
      const isMuted = event.detail?.soundOn === false;
      setMuted(isMuted);
      if (isMuted) setEnabled(false);
    };
    window.addEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, preference);
    return () => window.removeEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, preference);
  }, []);
  const id = reading?.id;
  useEffect(() => {
    if (!enabled || muted || !active || !id || document.hidden) return undefined;
    const src = narration[id];
    if (!src) { setUnavailable(true); return undefined; }
    let disposed = false;
    const audio = new Audio(src);
    audio.preload = 'none';
    audio.volume = 0.8;
    const failed = () => { if (!disposed) { setUnavailable(true); setEnabled(false); } };
    audio.onerror = failed;
    audio.play().catch(failed);
    const hide = () => { if (document.hidden) audio.pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => { disposed = true; audio.pause(); audio.onerror = null; audio.removeAttribute('src'); audio.load(); document.removeEventListener('visibilitychange', hide); };
  }, [id, enabled, muted, active]);
  return { enabled, muted, unavailable, toggle: () => { setUnavailable(false); setEnabled(value => !value); } };
}
