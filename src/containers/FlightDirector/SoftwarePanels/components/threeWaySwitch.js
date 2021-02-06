import React from "react";
import "./toggleSwitch.scss";

const ToggleSwitch = ({
  update,
  level = 0,
  connecting,
  startConnecting,
  id,
  page,
  onMouseDown,
  edit,
  scaleComp = () => {},
  scale = 1,
}) => {
  return (
    <div style={{transform: `scale(${scale})`}}>
      <div onPointerDown={onMouseDown}>
        <div
          className="switch no-inline"
          onPointerUp={() => {
            if (level === 1) update(0.5);
            if (level === 0.5) update(0);
            if (level === 0) update(1);
          }}
        >
          <div
            className={`toggle ${level === 1 ? "on" : ""} ${
              level === 0.5 ? "middle" : ""
            } ${level === 0 ? "off" : ""}`}
          />
        </div>
      </div>
      {page && edit && !connecting && (
        <div
          className="output"
          onPointerDown={evt => startConnecting(evt, id)}
        />
      )}
      {page && edit && <div className="scale" onPointerDown={scaleComp} />}
    </div>
  );
};

export default ToggleSwitch;
