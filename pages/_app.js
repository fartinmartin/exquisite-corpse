import { useState } from "react";
import Container from "../components/Container";
import CustomCursor from "../components/CustomCursor";
import Header from "../components/Header";
import Help from "../components/Help";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const [isHelping, setHelping] = useState(false);

  return (
    <>
      <Header setHelping={setHelping} />
      <main>
        <Container>
          <Component {...pageProps} />
        </Container>
      </main>
      <CustomCursor />
      {isHelping && <Help setHelping={setHelping} />}
    </>
  );
}
