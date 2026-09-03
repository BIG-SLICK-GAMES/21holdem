import "./globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito"
});

export const metadata = {
  title: "21 Hold'em",
  description: "A blackjack-meets-poker table game from Big Slick Games.",
  metadataBase: new URL("https://21-holdem.com"),
  openGraph: {
    title: "21 Hold'em",
    description: "A blackjack-meets-poker table game from Big Slick Games.",
    url: "https://21-holdem.com",
    siteName: "21 Hold'em",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("scrollRestoration" in history) {
                history.scrollRestoration = "manual";
              }
              window.scrollTo(0, 0);
              window.addEventListener("pageshow", function () {
                window.scrollTo(0, 0);
              });
            `
          }}
        />
      </head>
      <body className={nunito.variable}>{children}</body>
    </html>
  );
}
