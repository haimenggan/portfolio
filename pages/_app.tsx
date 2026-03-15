import type { AppProps } from "next/app";
import { Manrope } from "next/font/google";
import "../styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={manrope.variable} style={{ display: "contents" }}>
      <Component {...pageProps} />
    </main>
  );
}
