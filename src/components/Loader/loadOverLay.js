import { RotatingLines } from "react-loader-spinner";

const LoaderOverlay = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
      zIndex: 9999, // Higher z-index to keep it on top
    }}
  >
    <RotatingLines
      strokeColor="grey"
      strokeWidth="5"
      animationDuration="0.75"
      width="96"
      visible={true}
    />
  </div>
);

export default LoaderOverlay;
