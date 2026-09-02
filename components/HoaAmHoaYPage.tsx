"use client";

import confetti from "canvas-confetti";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, Backpack, UsersRound, ArrowDown, ArrowRight, Volume2, VolumeX, Sparkles, Heart, Camera, Flame, PartyPopper, Music2, AudioLines, Headphones, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { event } from "@/data/event";

declare global { interface Window { onTurnstileSuccess?: (token: string) => void; onTurnstileExpired?: () => void; } }

const typingPhrases = [
  "nơi mỗi người mang một thanh âm riêng.",
  "nơi những nhịp trẻ hòa thành một giai điệu chung.",
  "nơi ý tưởng bắt lửa và truyền lửa cho nhau.",
  "nơi Hòa Âm gặp gỡ Hỏa Ý."
];

function graphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const Seg = Intl.Segmenter as unknown as new (locale?: string, opts?: { granularity: "grapheme" }) => { segment: (s: string) => Iterable<{ segment: string }> };
    return Array.from(new Seg("vi", { granularity: "grapheme" }).segment(text), x => x.segment);
  }
  return Array.from(text);
}

function useTyping() {
  const [phrase, setPhrase] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const units = useMemo(() => graphemes(typingPhrases[phrase]), [phrase]);
  useEffect(() => {
    const done = count === units.length;
    const empty = count === 0;
    const delay = done && !deleting ? 1500 : deleting ? 35 : 62;
    const timer = setTimeout(() => {
      if (done && !deleting) return setDeleting(true);
      if (empty && deleting) { setDeleting(false); setPhrase(v => (v + 1) % typingPhrases.length); return; }
      setCount(v => v + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [count, deleting, units.length]);
  return units.slice(0, count).join("");
}

function Countdown() {
  const [left, setLeft] = useState(() => Math.max(0, new Date(event.date).getTime() - Date.now()));
  useEffect(() => { const id = setInterval(() => setLeft(Math.max(0, new Date(event.date).getTime() - Date.now())), 1000); return () => clearInterval(id); }, []);
  if (left <= 0) return <div className="countdown-live"><PartyPopper /> HÒA ÂM HỎA Ý BẮT ĐẦU RỒI!</div>;
  const total = Math.floor(left / 1000);
  const units = [Math.floor(total / 86400), Math.floor((total % 86400) / 3600), Math.floor((total % 3600) / 60), total % 60];
  return <div className="countdown-grid">{units.map((n, i) => <div className="count-card" key={i}><strong>{String(n).padStart(2, "0")}</strong><span>{["NGÀY", "GIỜ", "PHÚT", "GIÂY"][i]}</span></div>)}</div>;
}

function MiniCalendar() {
  const target = new Date(event.date);
  const year = target.getFullYear(), month = target.getMonth(), day = target.getDate();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: first }, () => 0).concat(Array.from({ length: days }, (_, i) => i + 1));
  return <div className="calendar-card">
    <div className="calendar-head"><div><span>SAVE THE DATE!</span><strong>THÁNG {String(month + 1).padStart(2, "0")}</strong></div><b>{year}</b></div>
    <div className="calendar-grid weekdays">{["CN","T2","T3","T4","T5","T6","T7"].map(x => <span key={x}>{x}</span>)}</div>
    <div className="calendar-grid">{cells.map((d, i) => <span key={i} className={d === day ? "event-day" : ""}>{d || ""}{d === day && <Heart size={12} fill="currentColor" />}</span>)}</div>
  </div>;
}

function Opening({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const reduced = useReducedMotion();
  const open = () => {
    if (opening) return; setOpening(true);
    if (!reduced) confetti({ particleCount: 100, spread: 90, origin: { y: .72 } });
    setTimeout(onOpen, reduced ? 100 : 2850);
  };
  return <motion.div className="opening" exit={{ opacity: 0 }} transition={{ duration: .65 }}>
    <div className="rain">{Array.from({length: 18}, (_,i) => <span key={i} style={{ left: `${(i*37)%100}%`, animationDelay: `${(i%7)*-.7}s`, animationDuration: `${5+(i%5)}s` }}>{["✦","♡","★","✧","❀"][i%5]}</span>)}</div>
    <div className="opening-copy"><span>YOU'VE GOT A SIGNAL</span><h1>Một nhịp hẹn<br/>đang chờ bạn <b>🔥</b></h1><div className="opening-mini-wave"><i/><i/><i/><i/><i/><i/></div></div>
    <button className={`envelope ${opening ? "is-open" : ""}`} onClick={open} aria-label="Mở thiệp mời">
      <div className="letter"><span>WELCOME TO</span><strong>HÒA ÂM<br/><em>HỎA Ý</em></strong><small>BẮC NINH • 2026</small><div className="letter-wave"><i/><i/><i/><i/><i/></div></div>
      <div className="env-back"/><div className="env-paper"/><div className="env-left"/><div className="env-right"/><div className="env-flap"/>
      <div className="seal bnc-seal" aria-label="Logo Đội SVTN Đồng hương Bắc Ninh"><img src="/assets/bnc-logo.jpeg" alt="Logo Đội SVTN Đồng hương Bắc Ninh" /></div>
    </button>
    <button className="open-hint" onClick={open}><Sparkles size={16}/> NHẤN ĐỂ MỞ THIỆP</button>
  </motion.div>;
}

export function HoaAmHoaYPage() {
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typing = useTyping();

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

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

  const toggleMusic = async () => { const a = audioRef.current; if (!a) return; if (a.paused) { try { await a.play(); setMusic(true); } catch {} } else { a.pause(); setMusic(false); } };
  const open = () => { setOpened(true); setTimeout(() => { audioRef.current?.play().then(() => setMusic(true)).catch(() => {}); }, 100); };
  const scrollToStory = () => document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <>
    <AnimatePresence>{!opened && <Opening onOpen={open}/>}</AnimatePresence>
    {opened && <main>
      {event.musicUrl && <><audio ref={audioRef} loop preload="none"><source src={event.musicUrl} type="audio/mpeg"/></audio><button className="music-btn" onClick={toggleMusic} aria-label={music ? "Tắt nhạc" : "Bật nhạc"}>{music ? <Volume2/> : <VolumeX/>}</button></>}
      <section className="hero section">
        <div className="hero-fire-glow"/><div className="hero-sound-rings" aria-hidden="true"><i/><i/><i/></div><div className="hero-orb one"/><div className="hero-orb two"/>
        <div className="hero-sparks" aria-hidden="true">{Array.from({length:36},(_,i)=><i key={i} style={{ left: `${2 + ((i * 29) % 96)}%`, animationDelay: `${-((i * 0.37) % 5.4)}s`, animationDuration: `${4.2 + (i % 6) * 0.45}s` }}/>)}</div>
        <motion.div className="hero-copy" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8}}>
          <span className="eyebrow">BẮC NINH ✦ TURN UP THE VOLUME</span><h1 className="hero-title"><span className="hero-title-line harmony-title">HÒA ÂM</span><span className="hero-title-line fire-title">HỎA Ý</span></h1><div className="hero-frequency" aria-hidden="true">{Array.from({length:22},(_,i)=><b key={i}/>)}</div><p>{event.organization}</p><blockquote>{event.tagline}</blockquote>
          <div className="hero-actions"><button className="btn primary" type="button" onClick={scrollToStory}>KHÁM PHÁ <ArrowDown size={18}/></button><a className="btn ghost" href="/dang-ky">ĐĂNG KÝ THAM GIA</a></div>
        </motion.div>
        <div className="scrapbook" aria-hidden="true"><div className="vinyl-disc"><Music2/><span>HÒA ÂM</span></div><div className="polaroid p1"><div className="photo-placeholder photo-real"><img src="/assets/hoa-am-card-1.jpeg" alt="Hoạt động của Đội SVTN Đồng hương Bắc Ninh" /></div><span>find your frequency ✦</span></div><div className="polaroid p2"><div className="photo-placeholder photo-real alt"><img src="/assets/hoa-am-card-2.jpeg" alt="Khoảnh khắc tập thể" /></div><span>spark the moment 🔥</span></div><div className="sticker star"><AudioLines/></div><div className="sticker heart"><Flame fill="currentColor"/></div><div className="floating-note note-a">♪</div><div className="floating-note note-b">♫</div></div>
      </section>

      <div className="marquee" aria-label="Hòa Âm Hỏa Ý · Bắc Ninh · Tuổi trẻ · Kết nối · Tình nguyện">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => (
            <span className="marquee-set" key={item}>HÒA ÂM HỎA Ý ✦ BẮC NINH ✦ TUỔI TRẺ ✦ KẾT NỐI ✦ TÌNH NGUYỆN ✦&nbsp;</span>
          ))}
        </div>
      </div>

      <section className="story section" id="story">
        <div className="section-number">01</div>
        <span className="eyebrow">HÒA ÂM HỎA Ý LÀ GÌ?</span>
        <h2>Khác thanh âm.<br/><i>Chung một ngọn lửa.</i></h2>
        <p>{event.intro}</p>
        <div className="concept-duo">
          <motion.article whileHover={{y:-7,rotate:-1}} className="concept-card harmony">
            <div className="concept-icon"><AudioLines/></div><small>01 / HÒA ÂM</small>
            <h3>Nghe nhau. Bắt nhịp nhau.</h3>
            <p>Mỗi người là một thanh âm khác biệt. Khi gặp đúng nhau, những cá tính riêng tạo thành một giai điệu chung.</p>
            <div className="concept-frequency" aria-hidden="true">{Array.from({length:22},(_,i)=><b key={i}/>)}</div>
          </motion.article>
          <motion.article whileHover={{y:-7,rotate:1}} className="concept-card fire">
            <div className="concept-icon"><Flame fill="currentColor"/></div><small>02 / HỎA Ý</small>
            <h3>Ý tưởng chạm nhau. Lửa bật lên.</h3>
            <p>Không chỉ gặp mặt, đây là lúc năng lượng, nhiệt huyết và những ý tưởng trẻ được truyền từ người này sang người khác.</p>
            <div className="fire-reactor" aria-hidden="true"><i/><i/><i/><span><Flame fill="currentColor"/></span></div>
          </motion.article>
        </div>
        <div className="value-grid">
          {[
            ["01","Bắt nhịp","Để khác biệt tìm được cùng tần số",<Headphones key="i"/>],
            ["02","Truyền lửa","Để năng lượng đi xa hơn một người",<Flame key="i" fill="currentColor"/>],
            ["03","Bật ý tưởng","Để một tia nhỏ thành điều đáng nhớ",<Zap key="i" fill="currentColor"/>],
            ["04","Kết nối","Để sau cuộc gặp là một hành trình",<UsersRound key="i"/>]
          ].map(([n,title,desc,icon],i)=><motion.article whileHover={{y:-7}} className={`value-card value-${i+1}`} key={String(title)}><div className="value-top"><small>{n}</small><span className="value-icon">{icon}</span></div><div className="value-pulse" aria-hidden="true"><i/><i/><i/><i/><i/></div><h3>{title}</h3><p>{desc}</p></motion.article>)}
        </div>
      </section>

      <section className="typing-section section"><div className="typing-flame"><Flame fill="currentColor"/></div><span>Hòa Âm Hỏa Ý là…</span><h2>{typing}<i>|</i></h2><div className="soundline" aria-hidden="true">{Array.from({length:36},(_,i)=><b key={i}/>)}</div></section>

      <section className="count-section section"><span className="eyebrow light">CHÚNG TA SẼ GẶP NHAU SAU</span><Countdown/><div className="calendar-info"><MiniCalendar/><div className="event-card"><span className="tape">HÒA ÂM HỎA Ý PASS</span><div><CalendarDays/><p><small>NGÀY</small><b>{event.dateLabel}</b></p></div><div><Clock3/><p><small>THỜI GIAN</small><b>{event.timeLabel}</b></p></div><div><MapPin/><p><small>ĐỊA ĐIỂM</small><b>{event.location}</b></p></div><div><Sparkles/><p><small>CHẤT RIÊNG</small><b>Mang theo phiên bản thật nhất của bạn</b></p></div><div><Backpack/><p><small>MANG THEO</small><b>{event.bring}</b></p></div><div><UsersRound/><p><small>ĐỐI TƯỢNG</small><b>{event.audience}</b></p></div></div></div></section>

      <section className="frequency-lab section">
        <div className="frequency-copy"><span className="eyebrow">TRẠM HÒA TẦN SỐ</span><h2>Đến đây với<br/><i>chất riêng.</i></h2><p>Mang theo một câu chuyện, một giai điệu bạn thích và năng lượng sẵn sàng bắt nhịp. Mỗi cá tính là một tần số riêng — gặp nhau để Hòa Âm, chạm nhau để Hỏa Ý.</p><div className="frequency-tags"><span>01 · MỘT CÂU CHUYỆN</span><span>02 · MỘT GIAI ĐIỆU</span><span>03 · 100% CHẤT RIÊNG</span></div></div>
        <div className="frequency-stage" aria-hidden="true">
          <div className="orbit orbit-one"><i>HÒA</i><i>ÂM</i></div><div className="orbit orbit-two"><i>HỎA</i><i>Ý</i></div>
          <div className="frequency-core"><div className="core-wave">{Array.from({length:9},(_,i)=><b key={i}/>)}</div><Flame fill="currentColor"/></div>
          <span className="satellite s1">♪</span><span className="satellite s2">✦</span><span className="satellite s3">♫</span>
        </div>
      </section>

      <section className="timeline-section section"><span className="eyebrow">FROM HELLO TO SEE YOU AGAIN</span><h2>Một buổi tối,<br/>rất nhiều <i>khoảnh khắc.</i></h2><div className="timeline">{event.timeline.map(([time,title,desc],i)=><motion.div className="timeline-row" key={time} initial={{opacity:0,x:i%2?-30:30}} whileInView={{opacity:1,x:0}} viewport={{once:true,amount:.35}}><time>{time}</time><div className="dot">{String(i+1).padStart(2,"0")}</div><div><h3>{title}</h3><p>{desc}</p></div></motion.div>)}</div></section>

      <section className="location section"><div className="location-card"><span className="eyebrow">CHÚNG TA SẼ GẶP NHAU Ở ĐÂU?</span><h2>{event.location}</h2><p><MapPin size={19}/>{event.address}</p><a className="btn primary" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">XEM TRÊN GOOGLE MAPS <ArrowRight size={18}/></a></div><div className="map-frame"><iframe title="Bản đồ địa điểm Hòa Âm Hỏa Ý" src={event.mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></section>

      <section className="memories section"><span className="eyebrow">HÒA ÂM HỎA Ý SẼ CÓ…</span><h2>Những thứ đáng để<br/><i>nhớ thật lâu.</i></h2><div className="memory-grid">{[
        ["01","TRÒ CHƠI","Bật mood ngay từ phút đầu",<PartyPopper key="m"/>],
        ["02","LÀM QUEN","Từ người lạ thành người cùng nhịp",<UsersRound key="m"/>],
        ["03","CHỤP ẢNH","Giữ lại những frame thật trẻ",<Camera key="m"/>],
        ["04","HOẠT ĐỘNG NHÓM","Cùng làm, cùng cháy, cùng cười",<Zap key="m"/>],
        ["05","GIAO LƯU","Nghe câu chuyện từ những thanh âm khác",<Music2 key="m"/>],
        ["06","CƯỜI THẬT NHIỀU","Đi về với thêm vài người để nhớ",<Heart key="m" fill="currentColor"/>]
      ].map(([n,t,d,icon],i)=><motion.article className={`memory memory-${i+1}`} whileHover={{y:-5}} key={String(n)}><div className="memory-head"><span>{n}</span><div className="memory-icon">{icon}</div></div><div className="memory-signal" aria-hidden="true">{Array.from({length:8},(_,j)=><i key={j}/>)}</div><b>{t}</b><p>{d}</p><div className="memory-glow"/></motion.article>)}</div></section>

      <section className="ready section"><div className="ready-icons"><Headphones/><Flame fill="currentColor"/><Zap fill="currentColor"/></div><span>READY TO JOIN THE FREQUENCY?</span><h2>Đừng để bản hòa âm này<br/><i>thiếu bạn.</i></h2><p>Mang theo chất riêng của bạn. Phần còn lại, để chúng mình cùng bắt nhịp.</p><a className="btn light-btn" href="/dang-ky">LET'S GO! <ArrowRight size={18}/></a></section>

      <footer><strong>HÒA ÂM HỎA Ý ✦ 2026</strong><span>Made with 🎧 + 🔥 by Đội SVTN Đồng Hương Bắc Ninh</span></footer>
    </main>}

  </>;
}
