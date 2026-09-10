import { useEffect, useReducer, useRef, useState } from 'react';
import { INITIAL_PLAYBACK, playbackReducer } from './firstHandStory';

export default function useTutorialPlayback(active) {
  const root = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [state, dispatch] = useReducer(playbackReducer, INITIAL_PLAYBACK);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(query.matches); if (query.matches) dispatch({ type: 'checkpoint' }); };
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0), { threshold: [0, 0.1] });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active || !visible || !state.playing) return undefined;
    let frame;
    let previous;
    const tick = (now) => {
      if (!document.hidden && root.current?.getClientRects().length) {
        if (previous !== undefined) dispatch({ type: 'tick', delta: Math.min(now - previous, 100) });
        previous = now;
      } else previous = undefined;
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => { previous = undefined; cancelAnimationFrame(frame); if (!document.hidden) frame = requestAnimationFrame(tick); };
    if (!document.hidden) frame = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); };
  }, [active, visible, state.playing]);
  return { root, state, dispatch, reducedMotion, visible };
}
