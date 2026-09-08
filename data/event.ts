export type QuestionType = "text" | "textarea" | "email" | "tel" | "number" | "radio" | "checkbox" | "select" | "yesno" | "rating" | "scale";
export type Question = { id: string; label: string; description?: string; type: QuestionType; required?: boolean; placeholder?: string; options?: string[]; allowOther?: boolean; step: 1 | 2 | 3 };

export const event = {
  name: "HÒA ÂM HỎA Ý",
  organization: "ĐỘI SINH VIÊN TÌNH NGUYỆN ĐỒNG HƯƠNG BẮC NINH",
  tagline: "Một buổi gặp mặt để làm quen, nghe lại những giai điệu quê mình, chơi cùng nhau và có thêm những người bạn mới.",
  // Đổi ngày thật tại đây. ISO +07:00 để countdown chính xác giờ Việt Nam.
  date: "2026-09-15T18:00:00+07:00",
  dateLabel: "Thứ Ba, 15/09/2026",
  timeLabel: "18:30 – 21:00",
  location: "Đại học Kinh tế Quốc dân",
  address: "Cánh phải Nhà Văn Hóa - Đại học Kinh tế Quốc dân",
  mapsUrl: "https://maps.app.goo.gl/kxBXsBaTdgLckqYp7",
  mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254.9298268680794!2d105.84487874256105!3d20.999656294540028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac71752d8f79%3A0xd2ec575c01017afa!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBLaW5oIFThur8gUXXhu5FjIETDom4gKE5FVSk!5e1!3m2!1svi!2s!4v1788366465649!5m2!1svi!2s",
  // Thay ảnh và nhạc bằng đúng hai tên file này trong public/assets.
  mapImageUrl: "/assets/hoa-am-map.png",
  musicUrl: "/assets/hoa-am-hoa-y.mp3",
  dressCode: ["BLUE", "WHITE", "JEANS"],
  bring: "Một tinh thần thật vui và sẵn sàng làm quen!",
  audience: "Những người con Bắc Ninh đang học tập tại Hà Nội",
  contact: {
    pageUrl: "https://www.facebook.com/doisinhvientinhnguyendonghuongbacninh",
    supportGroupUrl: "https://m.me/cm/AbZfkPVoGpSleHBU/?send_source=cm:copy_invite_link",
    leaderEmail: "doisvtndonghuongbacninh@gmail.com",
    leaderPhone: "0338437588",
  },
  intro: "Hòa Âm Hỏa Ý là buổi gặp mặt dành cho những người con Bắc Ninh đang học tập tại Hà Nội, mang theo hành trang là những thanh âm Kinh Bắc, là những nét văn hoá quê hương, chương trình là dịp để những người con Kinh Bắc gặp gỡ và mang những thanh âm rực rỡ của tuổi trẻ hoà với nhau.",
  timeline: [
    ["18:30–19:00", "CHECK-IN", "Đến nhận thông tin, check-in và làm quen với không gian chương trình."],
    ["19:00–19:10", "CHÀO SÂN", "Cùng ổn định chỗ ngồi và bắt đầu buổi gặp mặt."],
    ["19:10–19:20", "SẮC MÀU QUÊ HƯƠNG", "Mở đầu bằng một tiết mục mang âm hưởng Quan họ và những nét văn hóa quen thuộc của Bắc Ninh."],
    ["19:20–19:30", "VỀ MIỀN KINH BẮC", "Một minigame nhỏ để cùng nhớ, cùng đoán và khám phá thêm về quê mình."],
    ["19:30–19:35", "ĐỔI NHỊP", "Chuyển nhịp bằng một tiết mục trẻ trung, sôi động và giàu năng lượng."],
    ["19:35–19:45", "SÂN KHẤU GIAO LƯU", "Không gian dành cho những tiết mục và màu sắc riêng từ các bạn tham gia chương trình."],
    ["19:45–20:15", "HÒA GIỌNG CÙNG NHAU", "Mọi người cùng hát, cùng bắt nhịp và tạo nên một khoảnh khắc chung thật đáng nhớ."],
    ["20:15–20:45", "CHUỖI MINIGAME", "Cùng đồng đội vượt qua các thử thách vui tươi, tương tác và khuấy động bầu không khí."],
    ["20:45–20:55", "TRAO QUÀ & LƯU KHOẢNH KHẮC", "Khép lại bằng phần trao quà, giao lưu nhẹ nhàng và lưu lại những bức ảnh chung."],
  ],
  questions: [
    { id: "fullName", label: "Họ và tên?", type: "text", required: true, placeholder: "Nguyễn Văn A", step: 1 },
    { id: "phone", label: "Số điện thoại?", type: "tel", required: true, placeholder: "09xxxxxxxx", step: 1 },
    { id: "email", label: "Địa chỉ Email?", type: "email", required: true, placeholder: "bnc@gmail.com", step: 1 },
    { id: "school", label: "Em đang học ở đâu?", description: "Nhớ điền cả MSV nếu có yêu cầu nhé!", type: "radio", required: true, options: ["NEU", "HUST", "HUCE", "Khác"], step: 1 },
    { id: "facebook", label: "Link Facebook cá nhân?", type: "text", required: true, placeholder: "https://facebook.com/...", step: 1 },
    { id: "classMajor", label: "Lớp chuyên ngành?", type: "text", required: true, placeholder: "VD: K68 Kinh tế / IT1-02...", step: 2 },
    { id: "skills", label: "Em có kĩ năng, biệt tài hay sở thích gì không?", description: "VD: Biết chơi nhạc cụ, hát, nhảy,...", type: "textarea", required: true, placeholder: "Tự tin kể cho anh chị biết nhé...", step: 2 },
    { id: "performance", label: "Em có muốn đóng góp một tiết mục văn nghệ cho chương trình không?", type: "radio", required: true, options: ["Có", "Không"], step: 2 },
    { id: "note", label: "Em có điều gì thắc mắc hoặc muốn nhắn gửi tới anh chị không?", description: "Hãy chia sẻ cùng anh chị nhé!", type: "textarea", placeholder: "Nhắn anh chị bất cứ điều gì em muốn nhé 💙", step: 3 }
  ] as Question[]
};
