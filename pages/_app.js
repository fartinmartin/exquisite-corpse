import Container from "../components/Container";
import CustomCursor from "../components/CustomCursor";
import Header from "../components/Header";
import Help from "../components/Help";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <Container>
      <Component {...pageProps} />
      <Header />
      <CustomCursor />
      <Help />
    </Container>
  );
}
