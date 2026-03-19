import React, { useEffect, useState } from "react";
import axios from "axios";
function ChatHistory({ patientId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chats/history/${patientId}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  if (loading) return <p>Loading chat history...</p>;
  if (!history.length) return <p>No chat history found for this patient.</p>;

  return (
    <div className="chat-history">
      {history.map((item) => (
        <div key={item.id} className="chat-entry">
          <div>
            <strong>{item.role === "ai" ? "AI:" : "User:"}</strong> {item.message}
          </div>
          {item.ai_decision && (
            <div>
              <strong>Decision:</strong> {item.ai_decision}
            </div>
          )}
          {item.ai_reason && (
            <div>
              <strong>Reason:</strong> {item.ai_reason}
            </div>
          )}
          {item.labs_snapshot && (
            <div>
              <strong>Labs:</strong> {JSON.stringify(JSON.parse(item.labs_snapshot))}
            </div>
          )}
          <div className="meta">
            {new Date(item.created_at).toLocaleString()}
          </div>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default ChatHistory;