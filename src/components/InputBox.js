import { useState } from "react";

function InputBox({ sendMessage }) {

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{
      marginTop: "10px",
      display: "flex",
      gap: "5px"
    }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type message..."
        style={{
          flex: 1,
          padding: "10px",
          textAlign: "left"   // ✅ typing starts from LEFT
        }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default InputBox;