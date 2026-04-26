import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const API_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "/api";

const SOCKET_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_URL
    ? import.meta.env.VITE_SOCKET_URL
    : "http://localhost:8000";

/* ─── helpers ─────────────────────────────────────────────────── */
function fmtTime(d) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getTimeContext() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 16) return "afternoon";
  if (h >= 16 && h < 20) return "evening";
  return "night";
}

function getMealLabel(ctx) {
  return {
    morning: "breakfast",
    afternoon: "lunch",
    evening: "snacks",
    night: "dinner",
  }[ctx];
}

function getDietTip(meal, answer) {
  const tips = {
    breakfast: {
      yes: "Great start! 🌟 A balanced breakfast fuels your metabolism. Try to include protein + fiber.",
      no: "Skipping breakfast can slow metabolism. Try eggs, oats, or a fruit smoothie next time!",
    },
    lunch: {
      yes: "Perfect! 🥗 Aim for a balanced plate — protein, grains, and lots of veggies.",
      no: "A light lunch like dal-rice or a salad bowl keeps energy levels stable. Don't skip it!",
    },
    snacks: {
      yes: "👍 Healthy snacking is great! Nuts, fruits, or yogurt are ideal choices.",
      no: "An evening snack prevents overeating at dinner. Try a handful of almonds or a banana.",
    },
    dinner: {
      yes: "Excellent! 🌙 Keep dinner light — your body needs less energy at night.",
      no: "A light dinner like soup or roti-sabzi is easy to digest. Try to eat by 8 PM.",
    },
  };
  return (
    tips[meal]?.[answer] ||
    "Keep tracking your meals consistently for best results!"
  );
}

/* ─── bot conversation engine ─────────────────────────────────── */
function buildConversation(userName, timeCtx) {
  const meal = getMealLabel(timeCtx);
  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good night",
  };

  return [
    {
      id: "greet",
      botText: `${greetings[timeCtx]}${userName ? `, ${userName}` : ""} 👋 I'm your **Datalet Diet Assistant**. I'm here to help you eat right and stay healthy!`,
      options: null,
      next: "ask_meal",
    },
    {
      id: "ask_meal",
      botText: `Have you had your **${meal}** today? 🍽️`,
      options: ["Yes, I had it ✅", "Not yet ❌"],
      next: (ans) => (ans.startsWith("Yes") ? "meal_yes" : "meal_no"),
    },
    {
      id: "meal_yes",
      botText: null, // filled dynamically with getDietTip
      options: null,
      next: "ask_timing",
    },
    {
      id: "meal_no",
      botText: null,
      options: null,
      next: "ask_timing",
    },
    {
      id: "ask_timing",
      botText: "Are you maintaining consistent meal timings today?",
      options: ["Yes, on schedule 🕐", "Been irregular today"],
      next: (ans) => (ans.startsWith("Yes") ? "timing_good" : "timing_bad"),
    },
    {
      id: "timing_good",
      botText:
        "That's wonderful! ⏰ Consistent meal timings help regulate blood sugar and digestion. Keep it up!",
      options: null,
      next: "ask_water",
    },
    {
      id: "timing_bad",
      botText:
        "Try to eat within a 2-hour window each day. Set alarms if needed! Your body loves routine. ⏰",
      options: null,
      next: "ask_water",
    },
    {
      id: "ask_water",
      botText: "How's your water intake today? 💧",
      options: ["Good (2L+) 💧", "Could be better"],
      next: () => "water_tip",
    },
    {
      id: "water_tip",
      botText:
        "Staying hydrated helps flush toxins and keeps your kidneys healthy. Aim for 8 glasses daily! 🌊",
      options: null,
      next: "ask_help",
    },
    {
      id: "ask_help",
      botText:
        "Is there anything specific about your diet plan you'd like to know?",
      options: [
        "Protein intake",
        "Foods to avoid",
        "Calorie guide",
        "Connect with Dietician 👨‍⚕️",
      ],
      next: (ans) => {
        if (ans.includes("Dietician")) return "connect_diet";
        if (ans.includes("Protein")) return "tip_protein";
        if (ans.includes("avoid")) return "tip_avoid";
        return "tip_calories";
      },
    },
    {
      id: "tip_protein",
      botText:
        "For most patients, 0.8–1.2g of protein per kg of body weight daily is recommended. Lean meats, legumes, and dairy are great sources! 💪",
      options: null,
      next: "end",
    },
    {
      id: "tip_avoid",
      botText:
        "Generally avoid: high-sodium processed foods, excessive sugar, saturated fats, and alcohol. Your dietician can give you a personalized list! 🚫",
      options: null,
      next: "end",
    },
    {
      id: "tip_calories",
      botText:
        "Your caloric needs depend on your weight, height, and activity level. The BMR formula gives a baseline. I can help you track this over time! 📊",
      options: null,
      next: "end",
    },
    {
      id: "connect_diet",
      botText: "__CONNECT_DIETICIAN__", // special marker
      options: null,
      next: "end",
    },
    {
      id: "end",
      botText:
        "I'm always here if you have more questions! 💚 Stay healthy and remember — small consistent changes make a big difference.",
      options: null,
      next: null,
    },
  ];
}

/* ─── main component ──────────────────────────────────────────── */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Restore mode from localStorage
  const [mode, setMode] = useState(
    () => localStorage.getItem("cw_mode") || "assistant",
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dieticianTyping, setDieticianTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [assignedDietician, setAssignedDietician] = useState(null);
  // Restore convStep from localStorage
  const [convStep, setConvStep] = useState(() => {
    const saved = localStorage.getItem("cw_step");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [conversation, setConversation] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [connected, setConnected] = useState(false);

  const [rasaInput, setRasaInput] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const convRef = useRef(conversation);
  convRef.current = conversation;

  /* ── Rasa integration ── */
  const sendToRasa = async (message) => {
    if (!message || message.trim() === "") return;
    setIsTyping(true);
    try {
      const res = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "user123", message }),
      });
      const data = await res.json();
      if (data && data.length > 0) {
        data.forEach((msg, index) => {
          if (msg.text) {
            setTimeout(
              () => {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + index,
                    sender: "bot",
                    text: msg.text,
                    timestamp: new Date().toISOString(),
                  },
                ]);
                setIsTyping(false);
              },
              500 + index * 900,
            );
          }
        });
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              sender: "bot",
              text: "🙂 I didn't understand. Can you say again?",
              timestamp: new Date().toISOString(),
            },
          ]);
          setIsTyping(false);
        }, 400);
      }
    } catch {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: "⚠️ AI server not responding.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 400);
    }
  };

  /* ── scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, dieticianTyping]);

  /* ── fetch user profile ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/user/profile/basic", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const first = (data.full_name || "").split(" ")[0];
        setUserName(first || "");
        setUserId(data.id);
        // Also load assigned dietician directly from profile to avoid extra call
        if (data.assigned_dietician)
          setAssignedDietician(data.assigned_dietician);
      })
      .catch(() => {});
  }, []);

  /* ── build conversation when userName is ready ── */
  useEffect(() => {
    const ctx = getTimeContext();
    setConversation(buildConversation(userName, ctx));
  }, [userName]);

  /* ── fetch assigned dietician (if not already in profile) ── */
  useEffect(() => {
    if (!userId || assignedDietician) return;
    const token = localStorage.getItem("token");
    fetch(`/api/diet-chat/dietician/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.assigned_dietician)
          setAssignedDietician(data.assigned_dietician);
      })
      .catch(() => {});
  }, [userId]);

  /* ── socket.io setup ── */
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", { userId, role: "patient" });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("dietician_reply", (msg) => {
      const newMsg = {
        id: msg.id || Date.now(),
        sender: "dietician",
        text: msg.message,
        dietician: msg.dietician,
        timestamp: msg.created_at || new Date().toISOString(),
      };
      if (!open) {
        setUnreadCount((c) => c + 1);
      }
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on("dietician_typing", ({ typing }) => setDieticianTyping(typing));

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  /* ── load dietician chat history when switching to dietician mode ── */
  const loadDieticianHistory = useCallback(async () => {
    if (historyLoaded || !userId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/diet-chat/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = data.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.message,
        dietician: m.dietician,
        timestamp: m.created_at,
      }));
      setMessages((prev) => {
        // Avoid duplicates — keep existing messages, prepend history
        const existingIds = new Set(prev.map((m) => m.id));
        const newOnes = mapped.filter((m) => !existingIds.has(m.id));
        return [...newOnes, ...prev];
      });
      setHistoryLoaded(true);
    } catch {}
  }, [userId, historyLoaded]);

  /* ── start assistant conversation when chat opens ── */
  useEffect(() => {
    if (!open || conversation.length === 0) return;

    if (mode === "assistant") {
      // Restore saved AI messages
      const savedMsgs = localStorage.getItem("cw_assistant_messages");
      if (savedMsgs && messages.length === 0) {
        try {
          const parsed = JSON.parse(savedMsgs);
          if (parsed && parsed.length > 0) {
            setMessages(parsed);
            setUnreadCount(0);
            return; // restored — don't replay from step 0
          }
        } catch {}
      }
      if (messages.length === 0) {
        runAssistantStep(0);
        setTimeout(() => sendToRasa("hi"), 800);
      }
    }
    if (mode === "dietician") {
      loadDieticianHistory();
    }
    setUnreadCount(0);
  }, [open, mode, conversation.length]);

  /* ── persist AI assistant messages + step to localStorage ── */
  useEffect(() => {
    if (mode !== "assistant" || messages.length === 0) return;
    localStorage.setItem("cw_assistant_messages", JSON.stringify(messages));
    localStorage.setItem("cw_step", String(convStep));
  }, [messages, convStep, mode]);

  /* ── persist mode ── */
  useEffect(() => {
    localStorage.setItem("cw_mode", mode);
  }, [mode]);

  /* ── assistant conversation runner ── */
  async function runAssistantStep(stepIdx, mealAnswer) {
    const conv = convRef.current;
    if (stepIdx >= conv.length) return;
    const step = conv[stepIdx];
    if (!step) return;

    setIsTyping(true);
    const delay = Math.min(800 + step.botText?.length * 2 || 800, 2000);

    setTimeout(async () => {
      setIsTyping(false);

      let text = step.botText;

      // Dynamic meal tip
      if ((step.id === "meal_yes" || step.id === "meal_no") && mealAnswer) {
        const ctx = getTimeContext();
        const meal = getMealLabel(ctx);
        const ans = step.id === "meal_yes" ? "yes" : "no";
        text = getDietTip(meal, ans);
      }

      // Special dietician connect marker
      if (text === "__CONNECT_DIETICIAN__") {
        const token = localStorage.getItem("token");
        // Re-fetch to be sure (in case approved since last load)
        const dRes = await fetch(`/api/diet-chat/dietician/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let latestDietician = assignedDietician;
        if (dRes.ok) {
          const dData = await dRes.json();
          if (dData.assigned_dietician) {
            latestDietician = dData.assigned_dietician;
            setAssignedDietician(dData.assigned_dietician);
          }
        }

        const hasDoc = !!latestDietician;
        text = hasDoc
          ? `Great choice! Your assigned dietician is **${latestDietician}**. Click the button below to start a real conversation! 👆`
          : "You don't have an assigned dietician yet. Please contact admin to assign one to your profile.";

        const newMsg = {
          id: Date.now(),
          sender: "bot",
          text,
          timestamp: new Date().toISOString(),
          showConnectBtn: hasDoc,
        };
        setMessages((prev) => [...prev, newMsg]);
        setConvStep(stepIdx + 1);
        return;
      }

      const newMsg = {
        id: Date.now(),
        sender: "bot",
        text: text || "",
        timestamp: new Date().toISOString(),
        options: step.options,
      };
      setMessages((prev) => [...prev, newMsg]);
      setConvStep(stepIdx);

      // If no options needed — auto-advance after a short pause
      if (!step.options && step.next && typeof step.next === "string") {
        const nextIdx = conv.findIndex((s) => s.id === step.next);
        if (nextIdx !== -1) {
          setTimeout(() => runAssistantStep(nextIdx), 1200);
        }
      }
    }, delay);
  }

  function handleOptionClick(option) {
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: option,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const conv = convRef.current;
    const currentStep = conv[convStep];
    if (!currentStep) return;

    const nextId =
      typeof currentStep.next === "function"
        ? currentStep.next(option)
        : currentStep.next;
    if (!nextId) return;
    const nextIdx = conv.findIndex((s) => s.id === nextId);
    if (nextIdx === -1) return;

    // Pass the user's answer for dynamic tip generation
    setTimeout(() => runAssistantStep(nextIdx, option), 400);
  }

  /* ── send message to dietician ── */
  function sendDieticianMessage() {
    const text = input.trim();
    if (!text || !userId) return;
    setInput("");

    const optimistic = {
      id: `opt_${Date.now()}`,
      sender: "patient",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (socketRef.current?.connected) {
      socketRef.current.emit("patient_message", {
        userId,
        message: text,
        dietician: assignedDietician,
      });
    } else {
      // REST fallback
      const token = localStorage.getItem("token");
      fetch("/api/diet-chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          message: text,
          sender: "patient",
          dietician: assignedDietician,
        }),
      }).catch(() => {});
    }
  }

  function handleTyping(val) {
    setInput(val);
    if (!socketRef.current?.connected || !userId) return;
    socketRef.current.emit("typing_start", { userId, role: "patient" });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing_stop", { userId, role: "patient" });
    }, 1500);
  }

  function switchToDietician() {
    setMode("dietician");
    setMessages([]);
    setHistoryLoaded(false);
    setTimeout(() => loadDieticianHistory(), 100);
  }

  function switchToAssistant() {
    setMode("assistant");
    // Restore saved AI messages
    const savedMsgs = localStorage.getItem("cw_assistant_messages");
    if (savedMsgs) {
      try {
        const parsed = JSON.parse(savedMsgs);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {}
    }
    setMessages([]);
    const ctx = getTimeContext();
    const conv = buildConversation(userName, ctx);
    setConversation(conv);
    setTimeout(() => runAssistantStep(0), 300);
  }

  /* ── format message text with **bold** ── */
  function renderText(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>,
    );
  }

  const headerTitle =
    mode === "dietician"
      ? assignedDietician
        ? `💬 ${assignedDietician}`
        : "💬 Dietician Chat"
      : "🥗 Diet Assistant";

  const headerSubtitle =
    mode === "dietician"
      ? "Real-time messaging"
      : "Your smart health companion";

  /* ─── RENDER ──────────────────────────────────────────────────── */
  return (
    <>
      {/* ─── Floating Toggle Button ─── */}
      <button
        onClick={() => setOpen((o) => !o)}
        id="chatbot-toggle"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background:
            "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
          boxShadow:
            "0 8px 32px rgba(16, 185, 129, 0.45), 0 2px 8px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          transform: open ? "rotate(45deg) scale(1.05)" : "scale(1)",
        }}
        title="Diet Assistant"
        aria-label="Open diet assistant"
      >
        {open ? "✕" : "🥗"}
        {unreadCount > 0 && !open && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 20,
              height: 20,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              animation: "pulse-badge 1.5s ease-in-out infinite",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* ─── Chat Panel ─── */}
      <div
        id="chatbot-panel"
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          zIndex: 9999,
          width: 400,
          maxWidth: "calc(100vw - 48px)",
          height: 580,
          display: "flex",
          flexDirection: "column",
          borderRadius: 20,
          overflow: "hidden",
          background: "#0f172a",
          border: "1px solid rgba(16,185,129,0.2)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          fontFamily: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(30px) scale(0.95)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition:
            "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
        }}
        aria-live="polite"
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "14px 18px",
            background:
              "linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {mode === "dietician" ? "👨‍⚕️" : "🥗"}
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}
              >
                {headerTitle}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: connected ? "#4ade80" : "#94a3b8",
                    display: "inline-block",
                    boxShadow: connected ? "0 0 6px #4ade80" : "none",
                  }}
                />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                  {headerSubtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Mode toggle tabs */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={switchToAssistant}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background:
                  mode === "assistant"
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                transition: "background 0.2s",
              }}
            >
              🤖 AI
            </button>
            {assignedDietician && (
              <button
                onClick={switchToDietician}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  background:
                    mode === "dietician"
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "background 0.2s",
                  position: "relative",
                }}
              >
                💬 Doc
                {unreadCount > 0 && mode !== "dietician" && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems:
                  msg.sender === "user" || msg.sender === "patient"
                    ? "flex-end"
                    : "flex-start",
                marginBottom: 14,
              }}
            >
              {/* Dietician label */}
              {msg.sender === "dietician" && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#10b981",
                    marginBottom: 3,
                    paddingLeft: 4,
                    fontWeight: 600,
                  }}
                >
                  👨‍⚕️ {msg.dietician || assignedDietician || "Dietician"}
                </div>
              )}

              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius:
                    msg.sender === "user" || msg.sender === "patient"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.sender === "user" || msg.sender === "patient"
                      ? "linear-gradient(135deg, #059669, #10b981)"
                      : msg.sender === "dietician"
                        ? "linear-gradient(135deg, #1e40af, #3b82f6)"
                        : "rgba(255,255,255,0.06)",
                  border:
                    msg.sender === "bot"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                  color: "#f0fdf4",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {renderText(msg.text)}
              </div>

              {/* Options / quick replies */}
              {msg.options && msg.options.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 8,
                    maxWidth: "90%",
                  }}
                >
                  {msg.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOptionClick(opt)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                        border: "1px solid rgba(16,185,129,0.4)",
                        background: "rgba(16,185,129,0.08)",
                        color: "#6ee7b7",
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(16,185,129,0.2)";
                        e.currentTarget.style.borderColor =
                          "rgba(16,185,129,0.7)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(16,185,129,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(16,185,129,0.4)";
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Connect with Dietician button */}
              {msg.showConnectBtn && (
                <button
                  onClick={switchToDietician}
                  style={{
                    marginTop: 10,
                    padding: "8px 18px",
                    borderRadius: 20,
                    border: "none",
                    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  👨‍⚕️ Connect with Dietician
                </button>
              )}

              <span
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 4,
                  paddingLeft: 4,
                }}
              >
                {fmtTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {/* Typing indicator */}
          {(isTyping || dieticianTyping) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {[0, 0.3, 0.6].map((delay, i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: dieticianTyping ? "#3b82f6" : "#10b981",
                      display: "inline-block",
                      animation: `bounce 1.2s ease-in-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
              {dieticianTyping && (
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {assignedDietician || "Dietician"} is typing...
                </span>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        {mode === "dietician" && (
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(15,23,42,0.95)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendDieticianMessage()
                }
                placeholder={`Message ${assignedDietician || "your dietician"}...`}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0f4f8",
                  fontSize: 13.5,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(16,185,129,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <button
                onClick={sendDieticianMessage}
                disabled={!input.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "none",
                  background: input.trim()
                    ? "linear-gradient(135deg,#059669,#10b981)"
                    : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#334155",
                textAlign: "center",
              }}
            >
              🔒 Messages are end-to-end encrypted
            </div>
          </div>
        )}

        {/* {mode === "assistant" && (
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(15,23,42,0.95)",
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
              💬 Tap an option above to continue the conversation
            </p>
            {assignedDietician && (
              <button
                onClick={switchToDietician}
                style={{
                  marginTop: 8,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "1px solid rgba(59,130,246,0.4)",
                  background: "rgba(59,130,246,0.08)",
                  color: "#93c5fd",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                💬 Switch to Dietician Chat
              </button>
            )}
          </div>
        )} */}
        {mode === "assistant" && (
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(15,23,42,0.95)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={rasaInput}
                onChange={(e) => setRasaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rasaInput.trim()) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        sender: "user",
                        text: rasaInput.trim(),
                        timestamp: new Date().toISOString(),
                      },
                    ]);
                    sendToRasa(rasaInput.trim());
                    setRasaInput("");
                  }
                }}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0f4f8",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  if (!rasaInput.trim()) return;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      sender: "user",
                      text: rasaInput.trim(),
                      timestamp: new Date().toISOString(),
                    },
                  ]);
                  sendToRasa(rasaInput.trim());
                  setRasaInput("");
                }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "none",
                  background: rasaInput.trim()
                    ? "linear-gradient(135deg,#059669,#10b981)"
                    : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  cursor: rasaInput.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
            {assignedDietician && (
              <button
                onClick={switchToDietician}
                style={{
                  marginTop: 8,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "1px solid rgba(59,130,246,0.4)",
                  background: "rgba(59,130,246,0.08)",
                  color: "#93c5fd",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                💬 Switch to Dietician Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        #chatbot-panel::-webkit-scrollbar { width: 4px; }
        #chatbot-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        #chatbot-toggle:hover { transform: scale(1.1) !important; box-shadow: 0 12px 40px rgba(16,185,129,0.55) !important; }
        @media (max-width: 480px) {
          #chatbot-panel { width: calc(100vw - 24px) !important; right: 12px !important; bottom: 90px !important; }
          #chatbot-toggle { bottom: 16px !important; right: 16px !important; }
        }
      `}</style>
    </>
  );
}
