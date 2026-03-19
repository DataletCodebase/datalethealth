import React, { useEffect, useState } from "react";
import { runtimeTranslate } from "../utils/runtimeTranslate"; // Function for dynamic translation
import { useLanguage } from "../contexts/LanguageContext";

export default function AutoText({ children }) {
  const { language } = useLanguage(); // Get current language context
  const [translated, setTranslated] = useState(children); // Store translated content

  useEffect(() => {
    let active = true;

    async function translate() {
      if (!children) return;

      // Prevent translating English
      if (language === "en") {
        setTranslated(children); // If it's English, just set as is.
        return;
      }

      // If language is Hindi or Bengali, handle translation dynamically via Google Translate API
      const result = await runtimeTranslate(String(children), language);

      if (active) setTranslated(result);
    }

    translate();

    return () => {
      active = false;
    };
  }, [children, language]); // Run translation whenever children or language changes

  return <>{translated}</>;
}