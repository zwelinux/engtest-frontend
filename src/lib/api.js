// src/lib/api.js
const API = process.env.NEXT_PUBLIC_API;
// const API = "http://localhost:8000/api";


// ------------------------
// JWT Cookie Helper
// ------------------------
function authHeaders() {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/wa_token=([^;]+)/);
    if (m) return { Authorization: `Bearer ${decodeURIComponent(m[1])}` };
  }
  return {};
}

async function parseMaybeJSON(res) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return text; }
}

// ------------------------
// ENG FORMS
// ------------------------
export async function fetchEngForms() {
  const r = await fetch(`${API}/eng/forms/`);
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}

// ------------------------
// CREATE SUBMISSION
// ------------------------
export async function createSubmission(formId, payload) {
  const r = await fetch(`${API}/eng/submissions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      form: formId,
      anon_name: payload.name || "",
      anon_email: payload.email || "",
      anon_rank: payload.rank || "",
    }),
  });
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}

// ------------------------
// GET SUBMISSION STATUS
// ------------------------
export async function getSubmission(subId) {
  const r = await fetch(`${API}/eng/submissions/${subId}/`, {
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}

// ------------------------
// FETCH QUESTIONS
// ------------------------
export async function fetchQuestions(formId, subId) {
  const r = await fetch(`${API}/eng/forms/${formId}/questions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ submission_id: subId }),
  });
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}

// ------------------------
// POST ANSWER
// ------------------------
export async function postAnswer(subId, payload) {
  const r = await fetch(`${API}/eng/submissions/${subId}/answer/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}

// ------------------------
// FINISH TEST
// ------------------------
export async function finish(subId) {
  const r = await fetch(`${API}/eng/submissions/${subId}/finish/`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error(await parseMaybeJSON(r));
  return r.json();
}
