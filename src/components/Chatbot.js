import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import "./Chatbot.css";
import { jsPDF } from "jspdf";

const defaultMsg = [
  { sender: "bot", text: "Hello! 👋 How can I help you?" }
];

const autoTitle = (text) =>
  text.length > 28 ? text.slice(0, 28) + "..." : text;

function Chatbot() {

  /* LOAD STORAGE */
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved
      ? JSON.parse(saved)
      : [{ id: Date.now(), title: "New chat", messages: defaultMsg }];
  });

  const [activeId, setActiveId] = useState(sessions[0].id);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const bottomRef = useRef(null);
  const activeChat = sessions.find(s => s.id === activeId);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  /* SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, typing]);

  /* UPDATE MSG */
  const updateMessages = (msgs) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === activeId ? { ...s, messages: msgs } : s
      )
    );
  };

  /* SEND */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    const isFirstUserMsg =
      activeChat.messages.filter(m => m.sender === "user").length === 0;

    const newMsgs = [...activeChat.messages, { sender: "user", text }];
    updateMessages(newMsgs);

    /* AUTO TITLE */
    if (isFirstUserMsg) {
      setSessions(prev =>
        prev.map(s =>
          s.id === activeId ? { ...s, title: autoTitle(text) } : s
        )
      );
    }

    setTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ message:text })
      });

      const data = await res.json();

      updateMessages([
        ...newMsgs,
        { sender:"bot", text:data.reply || "No response from AI" }
      ]);

    } catch {
      updateMessages([
        ...newMsgs,
        { sender:"bot", text:"Cannot connect to backend." }
      ]);
    }

    setTyping(false);
  };

  /* NEW CHAT */
  const newChat = () => {
    const id = Date.now();
    setSessions([
      { id, title:"New chat", messages:defaultMsg },
      ...sessions
    ]);
    setActiveId(id);
    setSidebarOpen(false);
  };

  /* DELETE */
  const deleteChat = (id) => {
    const filtered = sessions.filter(s=>s.id!==id);

    if (!filtered.length) {
      const newId = Date.now();
      setSessions([{ id:newId, title:"New chat", messages:defaultMsg }]);
      setActiveId(newId);
    } else {
      setSessions(filtered);
      if (activeId === id) setActiveId(filtered[0].id);
    }
  };

  /* RENAME INLINE */
  const renameInline = (id, value) => {
    setSessions(prev =>
      prev.map(s => s.id===id ? {...s,title:value} : s)
    );
  };

  /* CLEAR CHAT */
  const clearChat = () => updateMessages(defaultMsg);

  /* EXPORT PDF */
  const exportPDF = () => {
    const doc = new jsPDF();
    let y=10;

    activeChat.messages.forEach(m=>{
      const line=`${m.sender==="user"?"You":"Bot"}: ${m.text}`;
      const split=doc.splitTextToSize(line,180);
      doc.text(split,10,y);
      y+=split.length*8;
      if(y>280){ doc.addPage(); y=10;}
    });

    doc.save("chat.pdf");
  };

  /* FILTER SEARCH */
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
       {sidebarOpen && (
    <div
      className="overlay"
      onClick={() => setSidebarOpen(false)}
    />
  )}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="sidebarTop">
          <button onClick={()=>setSidebarOpen(false)}>✕</button>
          <button className="newChatBtn" onClick={newChat}>
            + New chat
          </button>

          <input
            className="search"
            placeholder="Search chats..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>

        <div className="sessionList">

          {filteredSessions.map(s=>(
            <div
              key={s.id}
              className={`session ${s.id===activeId?"active":""}`}
            >

              {/* TITLE */}
              {editingId===s.id ? (
                <input
                  autoFocus
                  defaultValue={s.title}
                  onBlur={(e)=>{
                    renameInline(s.id,e.target.value || "New chat");
                    setEditingId(null);
                  }}
                />
              ) : (
                <span onClick={()=>setActiveId(s.id)}>
                  {s.title}
                </span>
              )}

              {/* 3 DOTS */}
              <button
                className="dots"
                onClick={()=>setMenuOpen(menuOpen===s.id?null:s.id)}
              >
                ⋮
              </button>

              {/* MENU */}
              {menuOpen===s.id && (
                <div className="menu">
                  <div onClick={()=>{
                    setEditingId(s.id);
                    setMenuOpen(null);
                  }}>Rename</div>

                  <div onClick={()=>{
                    deleteChat(s.id);
                    setMenuOpen(null);
                  }}>Delete</div>
                </div>
              )}

            </div>
          ))}

        </div>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="header">
          <button
            className="menuBtn"
            onClick={()=>setSidebarOpen(!sidebarOpen)}
          >☰</button>

          <h2>AI Chatbot</h2>

          <div>
            <button onClick={clearChat}>Clear</button>
            <button onClick={exportPDF}>PDF</button>
          </div>
        </div>

        <div className="messages">
          {activeChat.messages.map((m,i)=>(
            <Message key={i} sender={m.sender} text={m.text}/>
          ))}
          {typing && <Message sender="bot" text="Typing..." />}
          <div ref={bottomRef}/>
        </div>

        <div className="inputBar">
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Message AI..."
            onKeyDown={e=>e.key==="Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>

      </div>

    </div>
  );
}

export default Chatbot;