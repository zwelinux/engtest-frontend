"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { fetchEngForms } from "@/lib/api";
import { useLang } from "@/app/lang-context";

export default function Home() {
  const { lang } = useLang(); // "en" | "my"

  const [forms, setForms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEngForms();
        setForms(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(
          e?.message ||
            (lang === "en"
              ? "Failed to load forms"
              : "ဖောင်များကို မထုတ်ယူနိုင်ပါ")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {lang === "en"
            ? "English Placement Test"
            : "အင်္ဂလိပ်စာ စမ်းသပ်မေးခွန်းများ"}
        </h1>

        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          {lang === "en"
            ? "Simple English assessment that you can take on any device."
            : "မည်သည့်ဖုန်း၊ ကွန်ပျူတာမှ မဆို လွယ်ကူစွာ ဖြေဆိုနိုင်ပါသည်။"}
        </p>

        <div className="mt-6 flex items-center justify-center">
          <h2 className="font-medium">
            {lang === "en"
              ? "Read This Before Taking The Test"
              : "မဖြေဆိုခင် လုပ်ဆောင်ပုံ အဆင့်ဆင့်ကို ဖတ်ရှုပါ။"}
          </h2>
        </div>
      </section>

      {/* STEPS — Same as EQ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title_en: "Step 1",
            title_my: "လုပ်ဆောင်ရန် ၁",
            desc_en: "Click 'Start' to begin the test.",
            desc_my: "စတင်မည် ကိုနှိပ်ပါ။",
          },
          {
            title_en: "Step 2",
            title_my: "လုပ်ဆောင်ရန် ၂",
            desc_en: "Fill in your Name, Email & Rank correctly.",
            desc_my: "အမည်၊ email နှင့် ရာထူးကို မှန်ကန်စွာ ဖြည့်ပါ။",
          },
          {
            title_en: "Step 3",
            title_my: "လုပ်ဆောင်ရန် ၃",
            desc_en: "Select Myanmar flag to switch language.",
            desc_my: "မြန်မာလို ဖြေလိုပါက အလံလေးကိုနှိပ်ပါ။",
          },
        ].map((f) => (
          <div
            key={f.title_en}
            className="rounded-2xl border border-gray-200 p-4 bg-white"
          >
            <div className="text-sm font-semibold">
              {lang === "en" ? f.title_en : f.title_my}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {lang === "en" ? f.desc_en : f.desc_my}
            </div>
          </div>
        ))}
      </section>

      {/* FORM LIST */}
      <section id="forms" className="space-y-3">
        <h2 className="text-lg font-semibold">
          {lang === "en" ? "Click 'Start' to answer" : "ဖြေဆိုရန် နှိပ်ပါ။"}
        </h2>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
            {error}
          </div>
        )}

        {/* No Forms */}
        {!loading && !error && forms.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {lang === "en"
              ? "No test is published yet. Please check back later."
              : "မည်သည့် စမ်းသပ်မှုမျှ မထုတ်ပြန်သေးပါ။"}
          </div>
        )}

        {/* Forms */}
        {!loading && !error && forms.length > 0 && (
          <div className="grid grid-cols-1">
            {forms.map((f) => (
              <Link
                key={f.id}
                href={`/eng/${f.id}`}
                className="group block rounded-2xl border border-gray-200 bg-blue-100 p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium leading-tight group-hover:text-gray-900">
                    {f.title ||
                      (lang === "en" ? "Untitled form" : "ခေါင်းစဉ်မရှိသော ဖောင်")}
                  </h3>
                  <span className="text-xs text-gray-500">ID: {f.id}</span>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {lang === "en"
                    ? "Tap to begin the placement test."
                    : "စတင်ရန် နှိပ်ပါ။"}
                </p>

                <div className="mt-4 text-sm font-medium text-gray-900">
                  {lang === "en" ? "Start →" : "စတင်မည် →"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTNOTE */}
<p className="text-lg text-gray-700 leading-relaxed">
  {lang === "en"
    ? "Having trouble? Contact us on Viber:"
    : "အခက်အခဲရှိပါက Viber ဖြင့် ဆက်သွယ်နိုင်ပါသည်:"}{" "}
  
  <br />
  
  <a
    href="viber://chat?number=+959766109458"
    className="font-semibold underline text-purple-700"
  >
    +95 097 6610 9458
  </a>
  
  <br />

  <a
    href="viber://chat?number=+66845875734"
    className="font-semibold underline text-purple-700"
  >
    +66 084 587 5734
  </a>
</p>

    </div>
  );
}
