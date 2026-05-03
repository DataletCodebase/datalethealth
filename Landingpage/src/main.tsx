
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if (window.location.pathname === '/privacy-policy') {
    window.location.href = '/privacy-policy.html';
  } else {
    createRoot(document.getElementById("root")!).render(<App />);
  }

  