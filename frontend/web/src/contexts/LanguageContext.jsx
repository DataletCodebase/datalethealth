import React, { createContext, useContext, useState, useEffect } from 'react';
// import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en");
  // const [t, setT] = useState(translations.en);

  // New Changes
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  // useEffect(() => {
  //   // Update translations when language changes
  //   setT(translations[language] || translations.en);

  //   // Save language preference to localStorage
  //   localStorage.setItem('preferredLanguage', language);
  // }, [language]);

  useEffect(() => {
    // Load saved language preference on app start
    const savedLanguage = localStorage.getItem("lang");
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // const translate = (key, fallback = '') => {
  //   return t[key] || fallback || key;
  // };

  const value = {
    language,
    setLanguage,
    // t: translate,
    // translations: t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};