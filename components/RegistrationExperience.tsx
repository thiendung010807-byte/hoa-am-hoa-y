"use client";

import Script from "next/script";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { event, type Question } from "@/data/event";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

function isEmpty(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === "";
}

function QuestionControl({
  q,
  value,
  onChange,
  onQuickNext,
  allValues,
  onExtraChange,
}: {
  q: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onQuickNext: () => void;
  allValues: Record<string, unknown>;
  onExtraChange: (key: string, value: string) => void;
}) {
  const val = typeof value === "string" ? value : "";

  if (["text", "email", "tel", "number"].includes(q.type)) {
    return (
      <input
        className="flow-input"
        autoFocus
        type={q.type === "tel" ? "tel" : q.type}
        value={val}
        placeholder={q.placeholder}
        inputMode={q.type === "tel" ? "tel" : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onQuickNext();
          }
        }}
      />
    );
  }

  if (q.type === "textarea") {
    return (
      <textarea
        className="flow-input flow-textarea"
        autoFocus
        rows={4}
        value={val}
        placeholder={q.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (q.type === "radio" || q.type === "yesno") {
    const options = q.type === "yesno" ? ["Có 💙", "Chưa chắc"] : q.options || [];
    const otherSelected = val.startsWith("Khác:");
    return (
      <>
        <div className="flow-choices">
          {options.map((option) => {
            const selected = val === option || (option === "Khác" && otherSelected);
            return (
              <button
                type="button"
                className={`flow-choice ${selected ? "is-selected" : ""}`}
                key={option}
                onClick={() => {
                  if (option === "Khác" && q.allowOther) {
                    onChange("Khác: ");
                    return;
                  }
                  onChange(option);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
        {q.allowOther && otherSelected && (
          <input
            className="flow-input flow-other"
            autoFocus
            value={val.slice(6)}
            onChange={(e) => onChange(`Khác: ${e.target.value}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onQuickNext();
              }
            }}
            placeholder="Nhập câu trả lời của bạn"
          />
        )}
        {q.id === "school" && val === "NEU" && (
          <div className="flow-followup">
            <span>MSV của em</span>
            <input className="flow-input" value={String(allValues.studentId || "")} onChange={(e) => onExtraChange("studentId", e.target.value)} placeholder="Nhập mã sinh viên" />
          </div>
        )}
        {q.id === "school" && val === "Trường khác" && (
          <div className="flow-followup">
            <span>Tên trường của em</span>
            <input className="flow-input" value={String(allValues.otherSchool || "")} onChange={(e) => onExtraChange("otherSchool", e.target.value)} placeholder="Nhập tên trường" />
          </div>
        )}
        {q.id === "performance" && val === "Có" && (
          <div className="flow-followup">
            <span>Cho chúng mình biết thêm về tiết mục</span>
            <textarea className="flow-input flow-textarea" rows={3} value={String(allValues.performanceDetails || "")} onChange={(e) => onExtraChange("performanceDetails", e.target.value)} placeholder="Tên bài, hình thức biểu diễn và những mong muốn khác nếu có (hát cùng anh chị/bạn nào đó,...)" />
          </div>
        )}
      </>
    );
  }

  if (q.type === "checkbox") {
    const current = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="flow-choices">
        {(q.options || []).map((option) => (
          <button
            type="button"
            key={option}
            className={`flow-choice ${current.includes(option) ? "is-selected" : ""}`}
            onClick={() => onChange(current.includes(option) ? current.filter((x) => x !== option) : [...current, option])}
          >
            {current.includes(option) ? "✓ " : ""}{option}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === "select") {
    return (
      <select className="flow-input" autoFocus value={val} onChange={(e) => onChange(e.target.value)}>
        <option value="">Chọn một đáp án</option>
        {q.options?.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  }

  if (q.type === "rating" || q.type === "scale") {
    const max = q.type === "rating" ? 5 : 10;
    return (
      <div className="flow-scale">
        {Array.from({ length: max }, (_, i) => i + 1).map((number) => (
          <button
            type="button"
            key={number}
            className={Number(value) === number ? "is-selected" : ""}
            onClick={() => {
              onChange(number);
            }}
          >{number}</button>
        ))}
      </div>
    );
  }

  return null;
}


const checkpointEmojis = ["🪪", "📞", "💌", "🎓", "🔗", "📚", "🎸", "🎤", "💬"];
const CHECKPOINT_SPACING = 190;
const CHECKPOINT_EDGE_PADDING = 3200;
const CHECKPOINT_START_X = CHECKPOINT_EDGE_PADDING + 170;
const CHECKPOINT_TRACK_HEIGHT = 190;
const checkpointColors = ["#ffdf57", "#ff7aa8", "#76f0d0", "#8fd8ff", "#ffc86b", "#b4a0ff", "#ff8d75", "#7be0ff", "#fff176"];

function checkpointY(x: number) {
  // The curve and every checkpoint use the same equation, so icons stay exactly on the line.
  return 98 + 27 * Math.sin((x - 60) / 210) + 8 * Math.sin((x + 35) / 92);
}

function makeCurvePath(width: number) {
  const points: string[] = [];
  for (let x = 0; x <= width; x += 12) points.push(`${x},${checkpointY(x).toFixed(2)}`);
  return `M ${points.join(" L ")}`;
}

export function RegistrationExperience() {
  const questions = event.questions;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [website, setWebsite] = useState("");
  const reduced = useReducedMotion();
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const progress = ((index + 1) / questions.length) * 100;
  const checkpointWidth = CHECKPOINT_EDGE_PADDING * 2 + 340 + CHECKPOINT_SPACING * Math.max(questions.length - 1, 1);
  const curvePath = useMemo(() => makeCurvePath(checkpointWidth), [checkpointWidth]);
  const activeCheckpointX = CHECKPOINT_START_X + index * CHECKPOINT_SPACING;

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) event.preventDefault();
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!siteKey || !isLast) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const mountTurnstile = () => {
      if (cancelled) return;

      const api = window.turnstile;
      const container = turnstileContainerRef.current;

      if (!api || !container) {
        attempts += 1;
        if (attempts <= 40) {
          timer = setTimeout(mountTurnstile, 125);
        } else {
          setServerError("Không thể khởi tạo xác minh chống bot. Vui lòng tải lại trang.");
        }
        return;
      }

      try {
        if (turnstileWidgetIdRef.current) {
          api.remove(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }

        container.innerHTML = "";
        setTurnstileToken("");

        requestAnimationFrame(() => {
          if (cancelled || !turnstileContainerRef.current || !window.turnstile) return;

          try {
            turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
              sitekey: siteKey,
              theme: "light",
              action: "register",
              callback: (token: string) => {
                setTurnstileToken(token);
                setServerError("");
              },
              "expired-callback": () => setTurnstileToken(""),
              "timeout-callback": () => setTurnstileToken(""),
              "error-callback": () => {
                setTurnstileToken("");
                setServerError("Không tải được xác minh chống bot. Vui lòng tải lại trang hoặc thử lại sau.");
              },
            });
          } catch {
            attempts += 1;
            if (attempts <= 8 && !cancelled) {
              timer = setTimeout(mountTurnstile, 250);
            } else {
              setServerError("Không thể hiển thị xác minh chống bot. Vui lòng tải lại trang.");
            }
          }
        });
      } catch {
        attempts += 1;
        if (attempts <= 8) timer = setTimeout(mountTurnstile, 250);
      }
    };

    mountTurnstile();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (turnstileWidgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(turnstileWidgetIdRef.current); } catch {}
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [siteKey, isLast]);

  const answer = values[q.id];
  const displayIndex = String(index + 1).padStart(2, "0");
  const total = String(questions.length).padStart(2, "0");

  const validateCurrent = () => {
    if (q.required && isEmpty(answer)) {
      setError("Bạn trả lời câu này trước nhé ✦");
      return false;
    }
    if (q.id === "email" && answer && !/^\S+@\S+\.\S+$/.test(String(answer))) {
      setError("Email này chưa đúng định dạng.");
      return false;
    }
    if (q.id === "phone" && answer && !/^(?:\+84|0)(?:\d[ .-]?){8,10}$/.test(String(answer))) {
      setError("Số điện thoại chưa hợp lệ.");
      return false;
    }
    if (q.id === "school" && answer === "NEU" && isEmpty(values.studentId)) {
      setError("Em điền thêm MSV nhé ✦");
      return false;
    }
    if (q.id === "school" && answer === "Trường khác" && isEmpty(values.otherSchool)) {
      setError("Em điền tên trường nhé ✦");
      return false;
    }
    if (q.id === "performance" && answer === "Có" && isEmpty(values.performanceDetails)) {
      setError("Em cho chúng mình biết thêm về tiết mục nhé ✦");
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    if (isLast) return;
    setDirection(1);
    setIndex((v) => Math.min(questions.length - 1, v + 1));
  };

  const goBack = () => {
    if (index === 0) return;
    setError("");
    setDirection(-1);
    setIndex((v) => Math.max(0, v - 1));
  };

  const submit = async () => {
    if (!validateCurrent() || busy) return;
    if (siteKey && !turnstileToken) {
      setServerError("Vui lòng hoàn tất xác minh chống bot trước khi gửi đăng ký ✦");
      return;
    }
    setBusy(true);
    setServerError("");
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        school: values.school,
        facebook: values.facebook,
        classMajor: values.classMajor,
        skills: values.skills,
        performance: values.performance,
        note: values.note || "",
        turnstileToken,
        website,
        extraAnswers: {
          studentId: values.studentId || "",
          otherSchool: values.otherSchool || "",
          performanceDetails: values.performanceDetails || "",
        },
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể gửi đăng ký.");
      setSuccess(true);
      if (!reduced) {
        confetti({ particleCount: 180, spread: 110, origin: { y: .68 } });
        window.setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: .72 } }), 260);
        window.setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: .72 } }), 340);
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  };

  const variants = useMemo(() => ({
    enter: () => ({ opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : .992 }),
    center: { opacity: 1, y: 0, scale: 1 },
    exit: () => ({ opacity: 0, y: reduced ? 0 : -12, scale: reduced ? 1 : .995 }),
  }), [reduced]);

  if (success) {
    return (
      <main className="flow-page flow-success-page">
        <motion.div className="flow-success" initial={{ opacity: 0, y: 28, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
          <div className="flow-success-icon"><Check /></div>
          <span>YAY! SEE YOU SOON ✦</span>
          <h1>ĐĂNG KÝ<br/>THÀNH CÔNG!</h1>
          <p>Cảm ơn bạn đã đăng ký Hòa Âm Hỏa Ý. Đừng quên kiểm tra email để nhận thông tin từ BTC nhé!</p>
          <a href="/" className="flow-primary">QUAY LẠI TRANG CHÍNH <ArrowRight size={18}/></a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flow-page">
      {siteKey && <Script id="cf-turnstile-api" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />}
      <div className="flow-dots" aria-hidden="true" />
      <header className="flow-header">
        <a href="/" className="flow-home"><ChevronLeft size={18}/> HÒA ÂM HỎA Ý</a>
        <div className="flow-counter"><b>{displayIndex}</b><span>/ {total}</span></div>
      </header>

      <div className="flow-progress-top" aria-hidden="true"><span style={{ width: `${progress}%` }}/></div>

      <section className="flow-stage">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={q.id}
            className="flow-question"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? .01 : .42, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flow-kicker">CÂU {displayIndex} ✦ {q.step === 1 ? "VỀ BẠN" : q.step === 2 ? "HÒA ÂM HỎA Ý" : "MỘT CHÚT NỮA THÔI"}</span>
            <h1>{q.label}{q.required && <sup>*</sup>}</h1>
            {q.description && <p className="flow-description">{q.description}</p>}
            <div className="flow-control">
              <QuestionControl
                q={q}
                value={answer}
                onChange={(value) => {
                  setValues((current) => ({ ...current, [q.id]: value }));
                  setError("");
                  setServerError("");
                }}
                onQuickNext={goNext}
                allValues={values}
                onExtraChange={(key, value) => {
                  setValues((current) => ({ ...current, [key]: value }));
                  setError("");
                  setServerError("");
                }}
              />
              {error && <motion.p className="flow-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>}
              {serverError && <p className="flow-server-error">{serverError}</p>}
              {isLast && siteKey && <div className="flow-turnstile"><div ref={turnstileContainerRef} /></div>}
            </div>

            <div className="flow-actions">
              {index > 0 && <button type="button" className="flow-back" onClick={goBack}><ArrowLeft size={18}/> Quay lại</button>}
              {!isLast ? (
                <button type="button" className="flow-primary" onClick={goNext}>TIẾP TỤC <ArrowRight size={18}/></button>
              ) : (
                <button type="button" className="flow-primary" onClick={submit} disabled={busy}>{busy ? "ĐANG GỬI…" : "GỬI ĐĂNG KÝ ✦"}</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />

      <div className="flow-wave">
        <motion.div
          className="flow-checkpoint-track"
          style={{ width: checkpointWidth, height: CHECKPOINT_TRACK_HEIGHT }}
          animate={{ x: `calc(50vw - ${activeCheckpointX}px)` }}
          transition={reduced ? { duration: 0 } : { duration: .72, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg className="flow-curve" viewBox={`0 0 ${checkpointWidth} ${CHECKPOINT_TRACK_HEIGHT}`} preserveAspectRatio="none">
            <path d={curvePath} />
          </svg>
          {questions.map((question, checkpointIndex) => {
            const x = CHECKPOINT_START_X + checkpointIndex * CHECKPOINT_SPACING;
            const y = checkpointY(x);
            const active = checkpointIndex === index;
            const color = checkpointColors[checkpointIndex % checkpointColors.length];
            return (
              <div
                key={question.id}
                className="flow-checkpoint-anchor"
                style={{ left: x, top: y }}
              >
                <motion.div
                  aria-hidden="true"
                  className={`flow-checkpoint ${active ? "is-active" : ""}`}
                  style={{ "--checkpoint-accent": color } as React.CSSProperties}
                  animate={active && !reduced
                    ? { scale: [1.28, 1.36, 1.28], rotate: [-3, 3, -3], opacity: 1 }
                    : { scale: active ? 1.3 : .9, rotate: 0, opacity: active ? 1 : .68 }}
                  transition={active && !reduced
                    ? { duration: 1.55, ease: "easeInOut", repeat: Infinity }
                    : reduced ? { duration: 0 } : { duration: .38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="flow-checkpoint-icon">{checkpointEmojis[checkpointIndex % checkpointEmojis.length]}</span>
                  <span className="flow-checkpoint-number">{String(checkpointIndex + 1).padStart(2, "0")}</span>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
      <div className="flow-corner-spark"><Sparkles /></div>
    </main>
  );
}
