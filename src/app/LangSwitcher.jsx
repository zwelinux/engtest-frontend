"use client";

import { useLang } from "./lang-context";
import { useState } from "react";

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const flags = { en: "🇬🇧", my: "🇲🇲" };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-2xl"
      >
        {flags[lang]}
      </button>

      {open && (
        <div className="absolute mt-2 w-10 rounded-lg shadow bg-white border">
          {Object.keys(flags).map((code) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full p-2 text-xl ${
                lang === code ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {flags[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
