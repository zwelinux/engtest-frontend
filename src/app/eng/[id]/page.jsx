"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  createSubmission,
  postAnswer,
  finish,
  fetchQuestions,
  getSubmission,
} from "@/lib/api";

import { useLang } from "@/app/lang-context";

export default function EngRunner() {
  const { lang } = useLang();
  const { id } = useParams();
  const storageKey = `eng_run:${id}`;

  // Anonymous info
  const [anonName, setAnonName] = useState("");
  const [anonEmail, setAnonEmail] = useState("");
  const [anonRank, setAnonRank] = useState("");

  // Runtime state
  const [subId, setSubId] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------
  // Resume previous submission from localStorage 
  // ---------------------------------------------------------
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (!raw) return;

    (async () => {
      try {
        const saved = JSON.parse(raw);
        if (!saved?.subId) return;

        const status = await getSubmission(saved.subId);

        // Already finished
        if (status.finished_at) {
          localStorage.removeItem(storageKey);
          return;
        }

        setSubId(status.id);

        const qres = await fetchQuestions(id, status.id);
        const questions = qres.questions ?? [];
        setQs(questions);

        setDeadline(qres.deadline ?? status.deadline ?? null);

        const answered = status.answered_question_ids ?? [];
        setI(Math.min(answered.length, questions.length));
      } catch (e) {
        console.warn("Resume failed:", e);
        localStorage.removeItem(storageKey);
      }
    })();
  }, [id, storageKey]);

  // ---------------------------------------------------------
  // Start submission
  // ---------------------------------------------------------
async function handleStart(e) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const data = await createSubmission(id, {
      name: anonName,
      email: anonEmail,
      rank: anonRank,
    });

    setSubId(data.id);
    setDeadline(data.deadline);
    setQs(data.questions || []);
    setI(0);

    localStorage.setItem(storageKey, JSON.stringify({ subId: data.id }));
  } catch (err) {
  let msg = "Could not start test";

  if (err && typeof err === "object") {
    if (err.detail) {
      msg = err.detail;
    } else {
      const firstKey = Object.keys(err)[0];
      const firstVal = err[firstKey];

      if (Array.isArray(firstVal)) {
        msg = firstVal[0];
      } else if (typeof firstVal === "string") {
        msg = firstVal;
      }
    }
  } else if (typeof err === "string") {
    msg = err;
  }

    setError(msg);

  } finally {
    setLoading(false);
  }
}


  // ---------------------------------------------------------
  // Timer for auto-finish
  // ---------------------------------------------------------
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const left = useMemo(() => {
    return deadline ? new Date(deadline).getTime() - now : null;
  }, [deadline, now]);

  useEffect(() => {
    if (left !== null && left <= 0 && subId && !result) {
      (async () => {
        try {
          const res = await finish(subId);
          setResult(res);
        } catch (err) {
          setError(err?.message || "Auto finish failed.");
        } finally {
          localStorage.removeItem(storageKey);
        }
      })();
    }
  }, [left, subId, result, storageKey]);

  // ---------------------------------------------------------
  // Submit answer
  // ---------------------------------------------------------
  async function answer(val) {
    if (answerBusy) return;

    const q = qs[i];
    if (!q || !subId) return;

    setAnswerBusy(true);
    setError(null);

    try {
      await postAnswer(subId, { question_id: q.id, value: val });
    } catch (err) {
      const msg = err?.message || "";

      if (msg.includes("TIME_UP")) {
        try {
          const res = await finish(subId);
          setResult(res);
        } finally {
          localStorage.removeItem(storageKey);
        }
        return;
      }

      setError(
        lang === "en"
          ? "Failed to save answer. Try again."
          : "ဖြေဆိုမှု မှတ်မထားနိုင်ပါ။ ထပ်ကြိုးစားပါ။"
      );
      setAnswerBusy(false);
      return;
    }

    // Go next
    if (i + 1 < qs.length) {
      setI(i + 1);
      localStorage.setItem(storageKey, JSON.stringify({ subId }));
      setAnswerBusy(false);
    } else {
      // final
      try {
        const res = await finish(subId);
        setResult(res);
      } catch (e2) {
        setError(e2?.message || "Could not finish test.");
      } finally {
        localStorage.removeItem(storageKey);
        setAnswerBusy(false);
      }
    }
  }

  // ---------------------------------------------------------
  // UI — Step 1: Start Page
  // ---------------------------------------------------------
  if (!subId) {
    return (
      <form
        className="bg-white p-6 rounded-2xl shadow max-w-md mx-auto mt-10"
        onSubmit={handleStart}
      >
        <h2 className="text-xl font-semibold mb-4">
          {lang === "en" ? "Start English Test" : "အင်္ဂလိပ် စမ်းသပ်မှု စတင်ရန်"}
        </h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <input
          className="w-full border rounded p-2 mb-2"
          placeholder={lang === "en" ? "Name" : "နာမည်"}
          value={anonName}
          onChange={(e) => setAnonName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded p-2 mb-2"
          placeholder={lang === "en" ? "Email" : "အီးမေးလ်"}
          type="email"
          value={anonEmail}
          onChange={(e) => setAnonEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded p-2 mb-2"
          placeholder={lang === "en" ? "Rank" : "ရာထူး"}
          value={anonRank}
          onChange={(e) => setAnonRank(e.target.value)}
          required
        />

        <button
          className="w-full bg-black text-white rounded p-2"
          disabled={loading}
        >
          {loading
            ? lang === "en"
              ? "Starting…"
              : "စတင်နေပါသည်…"
            : lang === "en"
            ? "Start Test"
            : "စမည်"}
        </button>
      </form>
    );
  }

  // ---------------------------------------------------------
  // No Questions
  // ---------------------------------------------------------
  if (qs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow max-w-md mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-2">No Questions</h2>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Finished
  // ---------------------------------------------------------
  if (result) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow max-w-md mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-2">
          {lang === "en" ? "Completed" : "ပြီးပါပြီ"}
        </h2>

        <p className="text-sm">
          {lang === "en"
            ? "Thank you for completing the English Placement Test."
            : "အင်္ဂလိပ်စာ စမ်းသပ်မှု ပြီးဆုံးသွားပါပြီ။"}
        </p>

        <Link
          href="/"
          className="inline-block mt-4 text-sm border border-gray-300 rounded-xl px-4 py-2"
        >
          ← {lang === "en" ? "Back to Home" : "မူလစာမျက်နှာ"}
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render Question
  // ---------------------------------------------------------
  const q = qs[i];

  const sec = left !== null ? Math.max(0, Math.ceil(left / 1000)) : null;
  const pct = qs.length > 0 ? Math.min(100, (i / qs.length) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-xl mx-auto mt-10">

      {/* Progress */}
      <div className="h-2 bg-gray-200 rounded mb-4">
        <div
          className="h-2 bg-black rounded"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Timer */}
      {sec !== null && (
        <div
          className={`text-right text-sm mb-4 ${
            sec < 30
              ? "text-red-600 animate-pulse"
              : sec < 120
              ? "text-amber-600"
              : "text-gray-700"
          }`}
        >
          ⏳ {Math.floor(sec / 60)}:
          {String(sec % 60).padStart(2, "0")}
        </div>
      )}

      {/* Question */}
      <h2 className="text-lg font-semibold mb-4">
        {i + 1}. {q.text_en}
      </h2>

      {/* Choices or Text Input */}
      {q.qtype === "text" ? (
        <TextAnswer q={q} answer={answer} busy={answerBusy} lang={lang} />
      ) : (
        <div className="space-y-2">
          {q.choices.map((c) => (
            <button
              key={c.id}
              onClick={() => answer(c.value)}
              disabled={answerBusy}
              className={`block w-full text-left border rounded-xl p-3 hover:bg-gray-50 ${
                answerBusy ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {c.label_en}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {lang === "en"
          ? `Question ${i + 1}/${qs.length}`
          : `မေးခွန်း ${i + 1}/${qs.length}`}
      </div>
    </div>
  );
}

function TextAnswer({ q, answer, busy, lang }) {
  const [v, setV] = useState("");

  // ⭐ Reset input when question changes
  useEffect(() => {
    setV("");
  }, [q.id]);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy) answer(v.trim());
      }}
    >
      <input
        className="w-full border rounded-xl p-3"
        placeholder={
          lang === "en" ? "Type your answer…" : "အဖြေ ရိုက်ထည့်ပါ…"
        }
        value={v}
        onChange={(e) => setV(e.target.value)}
        required
      />

      <button
        className="w-full bg-black text-white rounded-xl p-3"
        disabled={busy}
      >
        {busy
          ? lang === "en"
            ? "Saving…"
            : "သိမ်းနေသည်…"
          : lang === "en"
          ? "Submit"
          : "တင်မည်"}
      </button>
    </form>
  );
}
