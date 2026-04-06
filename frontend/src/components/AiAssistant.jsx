import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const FREE_CHAT_LIMIT = 10;

export default function AiAssistant({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your SmartVahaan AI Assistant. Ask me any doubts about your car, and I'll instruct you!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState({
    is_premium: false,
    used: 0,
    free_limit: FREE_CHAT_LIMIT,
    remaining: FREE_CHAT_LIMIT,
  });
  
  const chatRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
    }
  }, [isOpen]);

  const fetchUsage = async () => {
    try {
      const response = await api.get("/ai/chat/usage");
      setUsage(response.data);
    } catch (err) {
      console.error("Failed to fetch AI usage:", err);
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    if (!usage.is_premium && usage.used >= usage.free_limit) {
      setError("You reached your 10 free AI chats. Upgrade to Premium for unlimited chats.");
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await api.post("/ai/chat", {
        message: userMessage,
        history,
      });

      const text = response.data?.reply || "I couldn't generate a response this time.";
      if (response.data?.usage) {
        setUsage(response.data.usage);
      }
      
      setMessages(prev => [...prev, { role: "ai", text }]);
    } catch (err) {
      console.error(err);
      const statusCode = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const usageData = detail?.usage || err?.response?.data?.usage;
      if (usageData) {
        setUsage(usageData);
      }

      if (statusCode === 402) {
        setError("You reached your 10 free AI chats. Upgrade to Premium for unlimited chats.");
      } else if (statusCode === 503) {
        setError("AI service is not configured on the server. Ask admin to set GEMINI_API_KEY.");
      } else {
        setError("Oops! My circuits got crossed. Try asking again.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={{ ...styles.container, background: colors.card, borderColor: colors.border }}>
        {/* Header */}
        <div style={{ ...styles.header, borderBottom: `1px solid ${colors.border}` }}>
          <div style={styles.headerTitle}>
             <span style={styles.aiIcon}>🤖</span>
             <div>
               <h3 style={{ margin: 0, fontSize: 16, color: colors.text }}>SmartVahaan AI</h3>
               <span style={{ fontSize: 11, color: "#4ade80" }}>
                {usage.is_premium
                  ? "Premium • Unlimited AI chats"
                  : `Free tier • ${Math.max(0, usage.remaining ?? (usage.free_limit - usage.used))}/${usage.free_limit} chats left`}
               </span>
             </div>
          </div>
          <button onClick={onClose} style={{ ...styles.closeBtn, color: colors.textSecondary }}>✕</button>
        </div>

        {/* Chat Area */}
        <div ref={chatRef} style={styles.chatArea}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  background: m.role === "user" ? colors.brand : (isDark ? "#1e293b" : "#f1f5f9"),
                  color: m.role === "user" ? colors.brandInverse : colors.text,
                  borderBottomRightRadius: m.role === "user" ? "4px" : "14px",
                  borderBottomLeftRadius: m.role === "ai" ? "4px" : "14px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                }}
              >
                {/* Basic markdown parsing to bold text logic if needed, but plain text goes here */}
                {m.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
               <div style={{ ...styles.typingBuble, background: isDark ? "#1e293b" : "#f1f5f9" }}>
                 <span style={styles.dot}></span><span style={styles.dot}></span><span style={styles.dot}></span>
               </div>
            </div>
          )}
          
          {error && (
            <div style={styles.errorMsgWrap}>
              <div style={styles.errorMsg}>{error}</div>
              {!usage.is_premium && usage.used >= usage.free_limit && (
                <button
                  style={styles.upgradeBtn}
                  onClick={() => {
                    onClose();
                    navigate("/premium-features");
                  }}
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ ...styles.inputArea, borderTop: `1px solid ${colors.border}` }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              !usage.is_premium && usage.used >= usage.free_limit
                ? "Free limit reached. Upgrade for more chats..."
                : "Ask about your vehicle..."
            }
            disabled={!usage.is_premium && usage.used >= usage.free_limit}
            style={{
              ...styles.input,
              background: isDark ? "#0f172a" : "#fff",
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping || (!usage.is_premium && usage.used >= usage.free_limit)}
            style={{ ...styles.sendBtn, background: input.trim() && !isTyping ? colors.brand : colors.textSecondary }}
          >
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes typing { 0% { transform: translateY(0px); opacity: 0.5; } 50% { transform: translateY(-3px); opacity: 1; } 100% { transform: translateY(0px); opacity: 0.5; } }
      `}</style>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(3px)",
    zIndex: 10000,
  },
  container: {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: "380px",
    height: "600px",
    maxWidth: "calc(100vw - 40px)",
    maxHeight: "calc(100vh - 40px)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    zIndex: 10001,
    overflow: "hidden",
    border: "1px solid",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  aiIcon: {
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px", height: "40px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    borderRadius: "50%",
    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "5px",
    borderRadius: "5px",
  },
  chatArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  inputArea: {
    padding: "16px",
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "20px",
    outline: "none",
    fontSize: "14px",
  },
  sendBtn: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  typingBuble: {
    padding: "12px 16px",
    borderRadius: "14px",
    borderBottomLeftRadius: "4px",
    display: "flex",
    gap: "4px",
    alignItems: "center"
  },
  dot: {
    width: "6px", height: "6px",
    background: "#a1a1aa",
    borderRadius: "50%",
    animation: "typing 1.5s infinite"
  },
  errorMsg: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: "12px",
    padding: "10px",
    background: "#fee2e2",
    borderRadius: "8px",
    margin: "10px 0"
  },
  errorMsgWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  upgradeBtn: {
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
};
