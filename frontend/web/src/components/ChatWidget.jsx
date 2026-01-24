import React, { useState, useEffect, useRef } from "react";

// NOTE: Vite exposes import.meta.env at build time; default to localhost for dev fallback.
const API_BASE = "http://51.20.2.246:8000";

async function postJSON(path, body) {
  const fullUrl = `${API_BASE}${path}`;
  console.log("Making API request to:", fullUrl);

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("Response status:", res.status);
  console.log("Response headers:", Array.from(res.headers.entries()));

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  try {
    const json = await res.json();
    console.log("Parsed JSON response:", json);
    return json;
  } catch (jsonErr) {
    try {
      const buf = await res.arrayBuffer();
      const decoded = new TextDecoder("utf-8").decode(buf);
      console.warn("Response could not be parsed as JSON — decoded text:", decoded);
      try {
        return JSON.parse(decoded);
      } catch (pErr) {
        return { _raw_text: decoded };
      }
    } catch (bufErr) {
      throw new Error("Failed to read response body: " + bufErr.message);
    }
  }
}

function extractTextFromBackendResponse(resp) {
  if (!resp && resp !== 0) return null;
  if (typeof resp === "string") return resp;
  if (resp._raw_text) return resp._raw_text;
  if (resp.message) return resp.message;
  if (resp.answer) return resp.answer;
  if (resp.text) return resp.text;
  if (resp.reply) return resp.reply;
  if (resp.data && (resp.data.answer || resp.data.message || resp.data.text)) {
    return resp.data.answer || resp.data.message || resp.data.text;
  }
  if (resp.ai_raw) {
    try {
      if (typeof resp.ai_raw === "string") return resp.ai_raw;
      if (typeof resp.ai_raw === "object") return JSON.stringify(resp.ai_raw);
    } catch {}
  }
  try {
    return JSON.stringify(resp);
  } catch {
    return String(resp);
  }
}

export default function ChatWidget({ onSubmitted, defaultConditionContext = [], onConditionChange }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [activeSection, setActiveSection] = useState("chat");
  const [liveAgent, setLiveAgent] = useState(null);

  const steps = [
    { key: "first_name", label: "Please provide your name" },
    { key: "phone", label: "Please provide your phone number" },
    { key: "age", label: "What's your age?" },
    { key: "weight", label: "What's your body weight (kg)?" },
    { key: "conditions", label: "Any chronic conditions or diseases? (or 'none')" },
  ];

  const [form, setForm] = useState({
    first_name: "",
    phone: "",
    age: "",
    weight: "",
    conditions: "",
  });

  const [loading, setLoading] = useState(false);
  const [doneMessage, setDoneMessage] = useState(null);
  const [error, setError] = useState(null);

  // condition context (multi-select) - persisted in this widget and reported to parent via onConditionChange
  const DOMAIN_OPTIONS = [
    { id: "kidney", label: "Kidney" },
    { id: "heart", label: "Heart" },
    { id: "diabetes", label: "Diabetes" },
  ];
  const [conditionContext, setConditionContext] = useState(defaultConditionContext || []);

  // Available live agents with avatars - Updated titles
  const availableAgents = [
    {
      id: 1,
      name: "Jinia Roy",
      title: "Health Diet Expert", // Changed from "Kidney Diet Expert"
      avatar: "👩‍⚕️",
      specialty: "Renal Nutrition",
      experience: "8 years",
      autoQuestions: [
        "Hello! I'm Jinia, your health diet specialist. How can I help you today?",
        "I've reviewed your information. Would you like me to create a personalized diet plan?",
        "Based on your details, I can help with meal planning, fluid management, and nutrient balance.",
        "What specific health concerns would you like to discuss first?"
      ]
    },
    {
      id: 2,
      name: "Dr. Tapas Roy",
      title: "Health Specialist", // Changed from "Nephrology Specialist"
      avatar: "👨‍⚕️",
      specialty: "Chronic Conditions",
      experience: "12 years",
      autoQuestions: [
        "Namaste! I'm Dr. Tapas. I see you're interested in health management.",
        "Your information looks good. Let's discuss your health goals.",
        "I can help you understand dietary restrictions and fluid intake recommendations.",
        "Would you like me to explain how different foods affect your health?"
      ]
    },
    {
      id: 3,
      name: "Rajashree Jena",
      title: "Health Nutritionist", // Changed from "Renal Nutritionist"
      avatar: "🧑‍⚕️",
      specialty: "Diet Planning",
      experience: "6 years",
      autoQuestions: [
        "Hi there! I'm Rajashree, your health nutrition expert.",
        "I can see you've provided your details. Ready to create your healthy eating plan?",
        "Let me help you with portion control and food choices for better health.",
        "What type of healthy recipes are you most interested in?"
      ]
    }
  ];

  // init messages when widget opens - Updated messages
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: 1, text: "Hello! I'm DatalethealthcareTM Assistant 👋", sender: "bot", timestamp: new Date() }, // Changed
        { id: 2, text: "I'm here to help you connect with our health experts. Let's get started!", sender: "bot", timestamp: new Date() } // Changed
      ]);
    }
  }, [open, messages.length]);

  // 🔄 Listen for external updates (from App.jsx)
  useEffect(() => {
    const handleExternalUpdate = (e) => {
      const newCtx = e.detail;
      setConditionContext(newCtx);
    };
    window.addEventListener("updateConditionContext", handleExternalUpdate);
    return () => window.removeEventListener("updateConditionContext", handleExternalUpdate);
  }, []);

  // when parent passes a new defaultConditionContext, sync it
  useEffect(() => {
    if (Array.isArray(defaultConditionContext) && defaultConditionContext.length) {
      setConditionContext(defaultConditionContext);
    }
  }, [defaultConditionContext && defaultConditionContext.join(",")]);

  // notify parent when conditionContext changes
  useEffect(() => {
    onConditionChange && onConditionChange(conditionContext);
  }, [conditionContext, onConditionChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // auto open after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text, sender: "bot", timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  };

  const addAgentMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text, sender: "agent", agent: liveAgent, timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  };

  function update(val) {
    setForm(prev => ({ ...prev, ...val }));
  }

  function toggleCondition(domainId) {
    setConditionContext(prev => {
      const s = new Set(prev || []);
      if (s.has(domainId)) s.delete(domainId); else s.add(domainId);
      const arr = Array.from(s);
      return arr;
    });
  }

  // quick user messages handling
  const handleUserMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = { id: Date.now(), text: userInput, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    const input = userInput.trim();
    setUserInput("");
    setIsTyping(true);

    setTimeout(() => {
      if (step === 0 && !form.first_name) {
        update({ first_name: input });
        addBotMessage(`Nice to meet you, ${input}! I'll help you connect with our health specialist.`, 800); // Changed
        setTimeout(() => {
          addBotMessage(steps[1].label, 1000);
          setStep(1);
        }, 1800);
      } else if (activeSection === "chat") {
        const responses = [
          "I understand you're looking for health advice. Let me connect you with our expert.", // Changed
          "That's a great question! Our health experts can provide personalized guidance.", // Changed
          "I'll make sure our specialist addresses this when they contact you."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addBotMessage(randomResponse, 800);
        setTimeout(() => {
          addBotMessage("Let me collect a few details to connect you with the right expert.", 1000);
          setActiveSection("form");
        }, 2000);
      } else if (activeSection === "liveAgent") {
        setTimeout(() => {
          const responses = [
            "I understand. Let me provide more details about that.",
            "That's a great question about health.",
            "I can help you with that aspect of healthy diet."
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          addAgentMessage(randomResponse, 1000);
        }, 1500);
      }
    }, 800);
  };

  function next() {
    setError(null);
    const key = steps[Math.min(step, steps.length - 1)].key;
    const v = (form[key] || "").toString().trim();

    if (!v) {
      setError("Please fill this field to continue.");
      return;
    }

    if (key === "phone") {
      const cleanPhone = v.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 12) {
        setError("Please enter a valid phone number (10-12 digits)");
        return;
      }
      update({ phone: cleanPhone });
    }

    if (step < steps.length - 1) {
      addBotMessage(steps[step + 1].label, 500);
    }

    setStep(s => Math.min(s + 1, steps.length));
  }

  function prev() {
    setError(null);
    setStep(s => Math.max(s - 1, 0));
  }

  // choose a live agent and simulate intros
  const connectToLiveAgent = () => {
    setLoading(true);

    const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    setLiveAgent(randomAgent);

    addBotMessage("Connecting you with a health expert...", 1000); // Changed

    setTimeout(() => {
      setActiveSection("liveAgent");
      addAgentMessage("Hello! I'm connecting you with our specialist...", 800);

      setTimeout(() => {
        addAgentMessage(`Hi! I'm ${randomAgent.name}, your ${randomAgent.title}. I specialize in ${randomAgent.specialty} with ${randomAgent.experience} experience.`, 1000);

        setTimeout(() => {
          randomAgent.autoQuestions.forEach((question, index) => {
            setTimeout(() => addAgentMessage(question, 500), (index + 1) * 1200);
          });
        }, 1200);

        setLoading(false);
      }, 1800);
    }, 1200);
  };

  // submit lead to backend (/leads/) and fallback to localStorage
  async function submit() {
    setError(null);
    setLoading(true);

    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, text: "Contacting server for a personalized reply...", sender: "bot", timestamp: new Date() }]);

    try {
      const requiredFields = ['first_name', 'phone', 'age', 'weight', 'conditions'];
      const missingFields = requiredFields.filter(field => !form[field]?.toString().trim());

      if (missingFields.length > 0) {
        throw new Error(`Please fill all fields: ${missingFields.join(', ')}`);
      }

      const cleanPhone = form.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 12) {
        throw new Error("Please enter a valid phone number (10-12 digits)");
      }

      const payload = {
        first_name: form.first_name.trim(),
        phone: cleanPhone,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        conditions: form.conditions.trim(),
        source: "datalethealthcare_chat", // Changed from "kidneybot_chat"
        timestamp: new Date().toISOString(),
        condition_context: conditionContext,
      };

      console.log("Submitting lead data:", payload);

      // Attempt network POST to backend /leads
      let backendResp = null;
      try {
        backendResp = await postJSON("/leads/", payload);
        console.log("Lead posted to backend /leads/ successfully. backend response:", backendResp);
      } catch (networkErr) {
        console.warn("Posting to backend failed, saving locally. Error:", networkErr);
        const storedLeads = JSON.parse(localStorage.getItem('datalethealthcare_leads') || '[]'); // Changed
        storedLeads.push({ ...payload, id: Date.now(), offline: true });
        localStorage.setItem('datalethealthcare_leads', JSON.stringify(storedLeads)); // Changed
      }

      // Keep a client copy as well
      const storedLeads = JSON.parse(localStorage.getItem('datalethealthcare_leads') || '[]'); // Changed
      storedLeads.push({ ...payload, id: Date.now() });
      localStorage.setItem('datalethealthcare_leads', JSON.stringify(storedLeads)); // Changed

      // Inform parent about submission
      onSubmitted && onSubmitted(payload);

      try {
        setMessages(prev => prev.filter(m => m.id !== tempId));

        if (backendResp) {
          const visibleText = extractTextFromBackendResponse(backendResp) || "Received response (no text)";
          setMessages(prev => [...prev, { id: Date.now(), text: visibleText, sender: "bot", timestamp: new Date() }]);
        } else {
          setMessages(prev => [...prev, { id: Date.now(), text: "Thanks — we've saved your request and will contact you shortly.", sender: "bot", timestamp: new Date() }]);
        }
      } catch (displayErr) {
        console.error("Failed to display backend response:", displayErr);
      }

      // Connect to live agent
      connectToLiveAgent();

      // Reset form state for next time
      setForm({ first_name: "", phone: "", age: "", weight: "", conditions: "" });
      setStep(0);
      setDoneMessage("✅ Perfect! Our health expert will contact you with personalized recommendations."); // Changed

      setTimeout(() => addBotMessage("✅ Received — our expert will review and contact you shortly.", 800), 800);

    } catch (e) {
      console.error("Submission error:", e);
      const errorMessage = e.message || "Failed to submit. Please try again.";
      setError(errorMessage);

      setMessages(prev => prev.filter(m => m.text !== "Contacting server for a personalized reply..."));

      setTimeout(() => addBotMessage(`Sorry, there was an error: ${errorMessage}`, 500), 1000);
    } finally {
      setLoading(false);
    }
  }

  // small helpers
  const HealthIcon = () => ( // Changed from KidneyIcon
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16C8 16 9.5 14 12 14C14.5 14 16 16 16 16"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const QuickQuestions = () => {
    const questions = [
      "What foods should I avoid?",
      "How much water should I drink?",
      "Can you create a meal plan?",
      "What about protein intake?",
      "Tell me about potassium levels"
    ];

    return (
      <div style={{ padding: "12px 0" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Quick questions:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => {
                setUserInput(question);
                setTimeout(() => handleUserMessage(), 100);
              }}
              style={{
                padding: "6px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#e6eef8",
                fontSize: "11px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // RENDER
  return (
    <div style={{
      position: "fixed",
      left: 60,
bottom: 20,

      zIndex: 9999,
      width: 400,
      maxWidth: "calc(100% - 40px)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif",
    }} aria-live="polite">
      {!open && (
<div style={{ display: "flex", justifyContent: "flex-start" }}>
          <button onClick={() => setOpen(true)} style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white", border: "none", padding: "14px 20px", borderRadius: "50px",
            cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
            display: "flex", alignItems: "center", gap: 8
          }} data-testid="open-chat">
            <HealthIcon /> {/* Changed */}
             Diet Assistant
          </button>
        </div>
      )}

      {open && (
        <div style={{
          background: "#1a1f36", color: "#f0f4f8", borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
          height: 550, display: "flex", flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: activeSection === "liveAgent" ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#667eea,#764ba2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 16 }}>
              {activeSection === "liveAgent" && liveAgent ? (
                <>
                  <div style={{ fontSize: 20 }}>{liveAgent.avatar}</div>
                  <div>
                    <div>{liveAgent.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.9, fontWeight: "normal" }}>{liveAgent.title}</div>
                  </div>
                </>
              ) : (
                <>
                  <HealthIcon /> {/* Changed */}
                  <span>DatalethealthcareTM Chat Assistant</span> {/* Changed */}
                </>
              )}
              <div style={{ padding: "2px 8px", background: "rgba(255,255,255,0.2)", borderRadius: 12, fontSize: 12, fontWeight: "normal" }}>
                {activeSection === "liveAgent" ? "Live" : "Online"}
              </div>
            </div>

            <button onClick={() => {
              setOpen(false);
              setActiveSection("chat");
              setLiveAgent(null);
              setStep(0);
              setForm({ first_name: "", phone: "", age: "", weight: "", conditions: "" });
            }} style={{
              background: "rgba(255,255,255,0.1)", color: "#94a3b8", border: "none", cursor: "pointer",
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", background: "linear-gradient(135deg,#0f172a,#1e293b)" }}>
            {messages.map((message) => (
              <div key={message.id} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: message.sender === "user" ? "flex-end" : "flex-start" }}>
                {message.sender === "agent" && message.agent && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 16 }}>{message.agent.avatar}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      <strong>{message.agent.name}</strong>
                      <span style={{ marginLeft: 6 }}>{message.agent.title}</span>
                    </div>
                  </div>
                )}

                <div style={{
                  background: message.sender === "user"
                    ? "linear-gradient(135deg,#667eea,#764ba2)"
                    : message.sender === "agent"
                      ? "linear-gradient(135deg,#059669,#047857)"
                      : "rgba(255,255,255,0.05)",
                  padding: "12px 16px",
                  borderRadius: 18,
                  maxWidth: "80%",
                  border: message.sender === "user" || message.sender === "agent" ? "none" : "1px solid rgba(255,255,255,0.1)"
                }}>
                  {message.text}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, padding: "0 8px" }}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                {activeSection === "liveAgent" && liveAgent && <div style={{ fontSize: 16 }}>{liveAgent.avatar}</div>}
                <div style={{
                  background: activeSection === "liveAgent" ? "linear-gradient(135deg,#059669,#047857)" : "rgba(255,255,255,0.05)",
                  padding: "12px 16px",
                  borderRadius: 18
                }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 50, background: "#94a3b8", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ width: 6, height: 6, borderRadius: 50, background: "#94a3b8", animation: "pulse 1.5s ease-in-out 0.5s infinite" }} />
                    <div style={{ width: 6, height: 6, borderRadius: 50, background: "#94a3b8", animation: "pulse 1.5s ease-in-out 1s infinite" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Selected domains display */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>Personalization context (select)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DOMAIN_OPTIONS.map(d => {
                  const active = conditionContext.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => {
                      toggleCondition(d.id);
                    }} style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: active ? "1px solid rgba(96,165,250,0.6)" : "1px solid rgba(255,255,255,0.04)",
                      background: active ? "linear-gradient(90deg,#60A5FA22,#3B82F622)" : "transparent",
                      color: active ? "#cff0ff" : "#cbd5e1",
                      cursor: "pointer"
                    }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={messagesEndRef} />

            {/* Form block */}
            {activeSection === "form" && !doneMessage && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginTop: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ marginBottom: 12, color: "#cbd5e1", fontSize: 14 }}>
                  {steps[Math.min(step, steps.length - 1)].label}
                </div>
                <input
                  value={form[steps[Math.min(step, steps.length - 1)].key] || ""}
                  onChange={(e) => update({ [steps[Math.min(step, steps.length - 1)].key]: e.target.value })}
                  placeholder={`Enter ${steps[Math.min(step, steps.length - 1)].key.replace('_', ' ')}...`}
                  style={{
                    width: "100%", padding: 12, borderRadius: 8,
                    border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)", color: "#f0f4f8", fontSize: 14, marginBottom: 12
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (step === steps.length - 1) submit();
                      else next();
                    }
                  }}
                />
                {error && <div style={{ color: "#fca5a5", marginBottom: 12, fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{`⚠️ ${error}`}</div>}
                <div style={{ display: "flex", gap: 10 }}>
                  {step > 0 && <button onClick={prev} style={{ flex: 1, padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)" }}>Back</button>}
                  {step < steps.length - 1 && <button onClick={next} style={{ flex: 1, padding: 10, borderRadius: 8, background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff", border: "none", fontWeight: 600 }}>Next →</button>}
                  {step === steps.length - 1 && <button onClick={submit} disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 8, background: loading ? "#94a3b8" : "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", fontWeight: 600 }}>{loading ? "🔄 Connecting..." : "✅ Connect with Expert"}</button>}
                </div>
              </div>
            )}

            {doneMessage && <div style={{ padding: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, textAlign: "center", marginTop: 16 }}>{doneMessage}</div>}
          </div>

          {/* Input area */}
          {(activeSection === "chat" || activeSection === "liveAgent") && !doneMessage && (
            <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
              {activeSection === "liveAgent" && <QuickQuestions />}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={activeSection === "liveAgent" ? "Type your message to the expert..." : "Type your message..."}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f0f4f8", fontSize: 14 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                />
                <button onClick={handleUserMessage} style={{ padding: "12px 20px", borderRadius: 24, background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Send</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>{activeSection === "liveAgent" ? "💬 Chatting with live expert" : "💡 We'll connect you with a DatalethealthcareTM health expert"}</div> {/* Changed */}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}