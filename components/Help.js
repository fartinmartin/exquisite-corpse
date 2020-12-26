import FullscreenModal from "./FullscreenModal";

const Help = ({ setHelping }) => (
  <FullscreenModal clickCallback={() => setHelping(false)}>
    Help
  </FullscreenModal>
);

export default Help;
