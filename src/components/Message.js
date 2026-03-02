import React from "react";

function Message({ sender, text }) {
  return (
    <div className={`msgRow ${sender}`}>
      <div className="bubble">{text}</div>
    </div>
  );
}

export default Message;