import "../game/legacy-game.scss";
import Script from "next/script";

export default function PlayLayout({ children }) {
  return (
    <>
      {children}
      <Script src="/fx-overlay/screenShake.js" strategy="afterInteractive" />
      <Script src="/fx-overlay/chipBurst.js" strategy="afterInteractive" />
      <Script src="/fx-overlay/potEffects.js" strategy="afterInteractive" />
      <Script src="/fx-overlay/audioLayer.js" strategy="afterInteractive" />
      <Script src="/fx-overlay/overlayUI.js" strategy="afterInteractive" />
      <Script src="/fx-overlay/fxOverlay.js" strategy="afterInteractive" />
    </>
  );
}
