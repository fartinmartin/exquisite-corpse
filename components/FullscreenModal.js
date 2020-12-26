import Container from "./Container";

const FullscreenModal = ({ children, clickCallback }) => (
  <div className="fs-modal" onClick={clickCallback}>
    <Container>{children}</Container>
  </div>
);
export default FullscreenModal;
