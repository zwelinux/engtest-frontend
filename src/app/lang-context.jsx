"use client";
import { createContext, useContext, useState } from "react";

const LangCtx = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");
  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
