"use client";

import confetti from "canvas-confetti";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, UsersRound, ArrowDown, ArrowRight, Volume2, VolumeX, Sparkles, Heart, Camera, Flame, PartyPopper, Music2, AudioLines, Headphones, Zap, Mail, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { event } from "@/data/event";

declare global { interface Window { onTurnstileSuccess?: (token: string) => void; onTurnstileExpired?: () => void; } }

const typingPhrases = [
  "nơi mỗi người mang một màu sắc, thanh âm riêng.",
  "nơi những tiếng cười tạo nên một không gian bùng cháy.",
  "nơi khởi nguồn cho những tình bạn mới.",
  "nơi đưa bạn trở về với quê hương từng gắn bó."
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

function Opening({ onOpen, onPrimeMusic }: { onOpen: () => void; onPrimeMusic: () => void }) {
  const [opening, setOpening] = useState(false);
  const reduced = useReducedMotion();
  const open = () => {
    if (opening) return;
    onPrimeMusic();
    setOpening(true);
    if (!reduced) {
      window.setTimeout(() => confetti({ particleCount: 70, spread: 72, scalar: .9, origin: { y: .68 } }), 1150);
      window.setTimeout(() => confetti({ particleCount: 120, spread: 105, scalar: 1.05, origin: { y: .55 } }), 2650);
    }
    setTimeout(onOpen, reduced ? 100 : 4350);
  };
  return <motion.div className="opening" exit={{ opacity: 0 }} transition={{ duration: .65 }}>
    <div className="opening-aurora" aria-hidden="true"><i/><i/><i/></div>
    <div className="opening-grain" aria-hidden="true"/>
    <div className="rain">{Array.from({length: 18}, (_,i) => <span key={i} style={{ left: `${(i*37)%100}%`, animationDelay: `${(i%7)*-.7}s`, animationDuration: `${5+(i%5)}s` }}>{["✦","♡","★","✧","❀"][i%5]}</span>)}</div>
    <div className="opening-copy"><span>THƯ MỜI DÀNH RIÊNG CHO BẠN</span><h1>Một thanh âm mới<br/>sắp <i>chạm lửa.</i></h1><p>Đội SVTN Đồng hương Bắc Ninh gửi bạn một lời hẹn.</p><div className="opening-mini-wave"><i/><i/><i/><i/><i/><i/></div></div>
    <button className={`envelope ${opening ? "is-open" : ""}`} onClick={open} aria-label="Mở thiệp mời">
      <div className="envelope-shadow" aria-hidden="true"/>
      <div className="letter"><div className="letter-frame"/><span>TRÂN TRỌNG MỜI BẠN ĐẾN VỚI</span><strong>HÒA ÂM<br/><em>HỎA Ý</em></strong><small>{event.dateLabel} · BẮC NINH</small><div className="letter-wave"><i/><i/><i/><i/><i/></div></div>
      <div className="env-back"/><div className="env-paper"/><div className="env-left"/><div className="env-right"/><div className="env-flap"/>
      <div className="seal bnc-seal" aria-label="Logo Đội SVTN Đồng hương Bắc Ninh"><img src="/assets/bnc-logo.jpeg" alt="Logo Đội SVTN Đồng hương Bắc Ninh" /></div>
    </button>
    <button className="open-hint" onClick={open} disabled={opening}><Sparkles size={16}/>{opening ? "ĐANG MỞ LỜI HẸN…" : "CHẠM ĐỂ MỞ THƯ"}</button>
  </motion.div>;
}

export function HoaAmHoaYPage() {
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
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

  const primeMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0;
    void audio.play().catch(() => {});
  };
  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.muted = false;
      audio.volume = .72;
      try { await audio.play(); setMusic(true); } catch { setMusic(false); }
      return;
    }
    audio.muted = !audio.muted;
    if (!audio.muted) audio.volume = .72;
    setMusic(!audio.muted);
  };
  const open = () => {
    setOpened(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = .72;
    void audio.play().then(() => setMusic(true)).catch(() => setMusic(false));
  };
  const updateMusicProgress = () => {
    const audio = audioRef.current;
    const progress = audio && Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.currentTime / audio.duration
      : 0;
    setMusicProgress(Math.min(1, Math.max(0, progress)));
  };
  const scrollToStory = () => document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <>
    {event.musicUrl && <audio ref={audioRef} loop preload="auto" onLoadedMetadata={updateMusicProgress} onDurationChange={updateMusicProgress} onTimeUpdate={updateMusicProgress}><source src={event.musicUrl} type="audio/mpeg"/></audio>}
    <AnimatePresence>{!opened && <Opening onOpen={open} onPrimeMusic={primeMusic}/>}</AnimatePresence>
    {opened && <main>
      {event.musicUrl && <button className={`music-btn ${music ? "is-playing" : "is-muted"}`} style={{ "--music-progress": `${musicProgress * 360}deg` } as CSSProperties} onClick={toggleMusic} aria-label={music ? "Tắt nhạc" : "Bật nhạc"} title={music ? "Tắt nhạc" : "Bật nhạc"}>{music ? <Volume2/> : <VolumeX/>}</button>}
      <section className="hero section">
        <div className="hero-fire-glow"/><div className="hero-sound-rings" aria-hidden="true"><i/><i/><i/></div><div className="hero-orb one"/><div className="hero-orb two"/>
        <div className="hero-sparks" aria-hidden="true">{Array.from({length:36},(_,i)=><i key={i} style={{ left: `${2 + ((i * 29) % 96)}%`, animationDelay: `${-((i * 0.37) % 5.4)}s`, animationDuration: `${4.2 + (i % 6) * 0.45}s` }}/>)}</div>
        <motion.div className="hero-copy" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8}}>
          <span className="eyebrow">BẮC NINH ✦ BẬT NHỊP LÊN, CHÁY HẾT MÌNH</span><h1 className="hero-title"><span className="hero-title-line harmony-title">HÒA ÂM</span><span className="hero-title-line fire-title">HỎA Ý</span></h1><div className="hero-frequency" aria-hidden="true">{Array.from({length:22},(_,i)=><b key={i}/>)}</div><p>{event.organization}</p><blockquote>{event.tagline}</blockquote>
          <div className="hero-actions"><button className="btn primary" type="button" onClick={scrollToStory}>KHÁM PHÁ <ArrowDown size={18}/></button><a className="btn ghost" href="/dang-ky">ĐĂNG KÝ THAM GIA</a></div>
        </motion.div>
        <div className="scrapbook" aria-hidden="true"><div className="vinyl-disc"><Music2/><span>HÒA ÂM</span></div><div className="polaroid p1"><div className="photo-placeholder photo-real"><img src="/assets/hoa-am-card-1.jpg" alt="Hoạt động của Đội SVTN Đồng hương Bắc Ninh" /></div><span>chạm đúng tần số ✦</span></div><div className="polaroid p2"><div className="photo-placeholder photo-real alt"><img src="/assets/hoa-am-card-2.jpg" alt="Khoảnh khắc tập thể" /></div><span>thắp lửa khoảnh khắc 🔥</span></div><div className="sticker star"><AudioLines/></div><div className="sticker heart"><Flame fill="currentColor"/></div><div className="floating-note note-a">♪</div><div className="floating-note note-b">♫</div></div>
      </section>

      <div className="marquee" aria-label="Hòa Âm Hỏa Ý · Bắc Ninh · Tuổi trẻ · Kết nối · Tình nguyện">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => (
            <span className="marquee-set" key={item}>HÒA ÂM HỎA Ý ✦ SINH VIÊN BẮC NINH ✦ TÌNH NGUYỆN GẮN BÓ ✦ DÂN CA QUAN HỌ ✦ DANH TIẾNG VANG XA ✦&nbsp;</span>
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
            <h3>Cùng nghe, cùng hát, cùng hòa giọng.</h3>
            <p>Từ Quan họ Bắc Ninh tới những khúc hát thời sinh viên rực cháy nhiệt huyết tuổi trẻ, hoà quyện với thanh âm của riêng mỗi người tạo nên dàn hoà âm cháy bỏng.</p>
            <div className="concept-frequency" aria-hidden="true">{Array.from({length:22},(_,i)=><b key={i}/>)}</div>
          </motion.article>
          <motion.article whileHover={{y:-7,rotate:1}} className="concept-card fire">
            <div className="concept-icon"><Flame fill="currentColor"/></div><small>02 / HỎA Ý</small>
            <h3>Cùng chơi, cùng chuyện trò, cùng hết mình.</h3>
            <p>Những tiết mục giao lưu, minigame và hoạt động đồng đội sẽ là sợi dây gắn kết để kết nối những tâm hồn đồng điệu, chúng ta sẽ cùng tạo nên những khoảnh khắc thật vui vẻ và đáng nhớ.</p>
            <div className="fire-reactor" aria-hidden="true"><i/><i/><i/><span><Flame fill="currentColor"/></span></div>
          </motion.article>
        </div>
        <div className="value-grid">
          {[
            ["01","GẶP NHAU","Bắt đầu từ những cái tên mới và những lời chào thân thương",<Headphones key="i"/>],
            ["02","TỰ HÀO","Đến Quan họ và những câu chuyện mang màu sắc Bắc Ninh",<Flame key="i" fill="currentColor"/>],
            ["03","CHƠI CÙNG NHAU","Thử thách nhóm với vô vàn điều thú vị chờ đón",<Zap key="i" fill="currentColor"/>],
            ["04","HÁT CÙNG NHAU","Là thời gian để những lời hát thổi bùng ngọn lửa nhiệt huyết tuổi trẻ",<UsersRound key="i"/>]
          ].map(([n,title,desc,icon],i)=><motion.article whileHover={{y:-7}} className={`value-card value-${i+1}`} key={String(title)}><div className="value-top"><small>{n}</small><span className="value-icon">{icon}</span></div><div className="value-pulse" aria-hidden="true"><i/><i/><i/><i/><i/></div><h3>{title}</h3><p>{desc}</p></motion.article>)}
        </div>
      </section>

      <section className="typing-section section"><div className="typing-flame"><Flame fill="currentColor"/></div><span>Hòa Âm Hỏa Ý là…</span><h2>{typing}<i>|</i></h2><div className="soundline" aria-hidden="true">{Array.from({length:36},(_,i)=><b key={i}/>)}</div></section>

      <section className="count-section section"><span className="eyebrow light">CHÚNG TA SẼ GẶP NHAU SAU</span><Countdown/><div className="calendar-info"><MiniCalendar/><div className="event-card"><span className="tape">HÒA ÂM HỎA Ý PASS</span><div><CalendarDays/><p><small>NGÀY</small><b>{event.dateLabel}</b></p></div><div><Clock3/><p><small>THỜI GIAN</small><b>{event.timeLabel}</b></p></div><div><MapPin/><p><small>ĐỊA ĐIỂM</small><b>{event.location}</b></p></div><div><UsersRound/><p><small>DÀNH CHO</small><b>{event.audience}</b></p></div></div></div></section>

      <section className="frequency-lab section">
        <div className="frequency-copy"><span className="eyebrow">TRẠM HÒA TẦN SỐ</span><h2>Đến đây với<br/><i>chất riêng.</i></h2><p>Mang theo một câu chuyện, một giai điệu bạn thích và năng lượng sẵn sàng bắt nhịp. Mỗi cá tính là một tần số riêng — gặp nhau để Hòa Âm, chạm nhau để Hỏa Ý.</p><div className="frequency-tags"><span>01 · MỘT CÂU CHUYỆN</span><span>02 · MỘT GIAI ĐIỆU</span><span>03 · MỘT TRÁI TIM</span></div></div>
        <div className="frequency-stage" aria-hidden="true">
          <div className="orbit orbit-one"><i>HÒA</i><i>ÂM</i></div><div className="orbit orbit-two"><i>HỎA</i><i>Ý</i></div>
          <div className="frequency-core"><div className="core-wave">{Array.from({length:9},(_,i)=><b key={i}/>)}</div><Flame fill="currentColor"/></div>
          <span className="satellite s1">♪</span><span className="satellite s2">✦</span><span className="satellite s3">♫</span>
        </div>
      </section>

      <section className="timeline-section section"><span className="eyebrow">TIMELINE HÒA ÂM HỎA Ý</span><h2>Một buổi tối,<br/>rất nhiều <i>khoảnh khắc.</i></h2><div className="timeline">{event.timeline.map(([time,title,desc],i)=><motion.div className="timeline-row" key={time} initial={{opacity:0,x:i%2?-30:30}} whileInView={{opacity:1,x:0}} viewport={{once:true,amount:.35}}><time>{time}</time><div className="dot">{String(i+1).padStart(2,"0")}</div><div><h3>{title}</h3><p>{desc}</p></div></motion.div>)}</div></section>

      <section className="location section"><div className="location-card"><span className="eyebrow">CHÚNG TA SẼ GẶP NHAU Ở ĐÂU?</span><h2>{event.location}</h2><p><MapPin size={19}/>{event.address}</p><a className="btn primary" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">XEM TRÊN GOOGLE MAPS <ArrowRight size={18}/></a></div><div className="map-image-card"><div className="map-image-placeholder" aria-hidden="true"><MapPin/><span>SƠ ĐỒ ĐỊA ĐIỂM</span><small>HÒA ÂM HỎA Ý</small></div><img src={event.mapImageUrl} alt="Sơ đồ địa điểm tổ chức Hòa Âm Hỏa Ý" onError={(image) => { image.currentTarget.hidden = true; }}/><span className="map-image-label">MAP · HÒA ÂM HỎA Ý</span></div></section>

      <section className="memories section"><span className="eyebrow">HÒA ÂM HỎA Ý SẼ CÓ…</span><h2>Những thứ đáng để<br/><i>nhớ thật lâu.</i></h2><div className="memory-grid">{[
        ["01","TRÒ CHƠI BẮT NHỊP","Phá băng cực nhanh, bật mood cực cháy",<PartyPopper key="m"/>],
        ["02","KẾT NỐI ĐỒNG HƯƠNG","Gặp người cùng quê, tìm thêm người cùng tần số",<UsersRound key="m"/>],
        ["03","CHECK-IN SÁNG TẠO","Lên hình thật chất, mang về những khoảnh khắc đáng nhớ",<Camera key="m"/>],
        ["04","THỬ THÁCH ĐỒNG ĐỘI","Cùng phối hợp, cùng bứt phá, cùng tạo nên bất ngờ",<Zap key="m"/>],
        ["05","CHUYỆN NHÀ – CHUYỆN MÌNH","Lắng nghe những câu chuyện gần gũi từ người Bắc Ninh xa quê",<Heart key="m" fill="currentColor"/>],
        ["06","BÙNG NỔ HÒA ÂM","Khép lại một đêm rực rỡ, mở ra những tình bạn mới",<Music2 key="m"/>]
      ].map(([n,t,d,icon],i)=><motion.article className={`memory memory-${i+1}`} whileHover={{y:-5}} key={String(n)}><div className="memory-head"><span>{n}</span><div className="memory-icon">{icon}</div></div><div className="memory-signal" aria-hidden="true">{Array.from({length:8},(_,j)=><i key={j}/>)}</div><b>{t}</b><p>{d}</p><div className="memory-glow"/></motion.article>)}</div></section>

      <section className="ready section"><div className="ready-icons"><Headphones/><Flame fill="currentColor"/><Zap fill="currentColor"/></div><span>SẴN SÀNG THAM GIA HOÀ ÂM HOẢ Ý?</span><h2>Đừng để bản hòa âm này<br/><i>thiếu bạn.</i></h2><p>Mang theo chất riêng của bạn, cùng hoà vào nhịp nhạc của bản giao hưởng “Hoà Âm Hoả Ý”.</p><a className="btn light-btn" href="/dang-ky">LET&apos;S GO! <ArrowRight size={18}/></a></section>

      <footer className="site-footer">
        <div className="footer-brand"><span>ĐỘI SVTN ĐỒNG HƯƠNG BẮC NINH</span><strong>HÒA ÂM<br/><i>HỎA Ý</i></strong><p>Cần thêm thông tin? Chúng mình luôn ở đây để bắt nhịp cùng bạn.</p></div>
        <div className="footer-contacts">
          <a href={event.contact.pageUrl} target="_blank" rel="noopener noreferrer"><MessageCircle/><span><small>PAGE CỦA ĐỘI</small><b>Ghé thăm Page Đội</b></span><ExternalLink/></a>
          <a href={event.contact.supportGroupUrl} target="_blank" rel="noopener noreferrer"><UsersRound/><span><small>GROUP HTHT BẮC NINH</small><b>Hỗ trợ học tập K68 NEU</b></span><ExternalLink/></a>
          <a href={`mailto:${event.contact.leaderEmail}`}><Mail/><span><small>EMAIL CỦA ĐỘI</small><b>{event.contact.leaderEmail}</b></span><ArrowRight/></a>
          <a href={`tel:${event.contact.leaderPhone.replace(/\s/g, "")}`}><Phone/><span><small>SĐT ĐỘI TRƯỞNG</small><b>{event.contact.leaderPhone}</b></span><ArrowRight/></a>
        </div>
        <div className="footer-bottom"><strong>HÒA ÂM HỎA Ý ✦ 2026</strong><span>Made with 🎧 + 🔥 by Đội Sinh Viên Tình Nguyện Đồng Hương Bắc Ninh</span></div>
      </footer>
    </main>}

  </>;
}
