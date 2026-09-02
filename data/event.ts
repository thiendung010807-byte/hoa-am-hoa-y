export type QuestionType = "text" | "textarea" | "email" | "tel" | "number" | "radio" | "checkbox" | "select" | "yesno" | "rating" | "scale";
export type Question = { id: string; label: string; description?: string; type: QuestionType; required?: boolean; placeholder?: string; options?: string[]; allowOther?: boolean; step: 1 | 2 | 3 };

export const event = {
  name: "HÒA ÂM HỎA Ý",
  organization: "ĐỘI SINH VIÊN TÌNH NGUYỆN ĐỒNG HƯƠNG BẮC NINH",
  tagline: "Mỗi người một thanh âm. Khi cùng bắt nhịp, chúng ta tạo nên một ngọn lửa rất riêng.",
  // Đổi ngày thật tại đây. ISO +07:00 để countdown chính xác giờ Việt Nam.
  date: "2026-09-20T18:15:00+07:00",
  dateLabel: "Chủ nhật, 20/09/2026",
  timeLabel: "18:15 – 20:55",
  location: "Hà Nội",
  address: "Địa điểm chính thức sẽ được BTC cập nhật sớm",
  mapsUrl: "https://maps.google.com",
  mapsEmbedUrl: "https://www.google.com/maps?q=H%C3%A0+N%E1%BB%99i&output=embed",
  musicUrl: "",
  dressCode: ["BLUE", "WHITE", "JEANS"],
  bring: "Một tinh thần thật vui và sẵn sàng làm quen!",
  audience: "Những người con Bắc Ninh và các bạn muốn tìm hiểu về Đội",
  intro: "Hòa Âm Hỏa Ý là cuộc gặp của những thanh âm trẻ: mỗi người mang một màu sắc, một nhịp riêng, một câu chuyện riêng. Khi cùng xuất hiện, chúng ta bắt nhịp để tạo nên “Hòa Âm” và cùng truyền cho nhau “Hỏa Ý” — ngọn lửa của nhiệt huyết, ý tưởng và tinh thần đồng hành.",
  timeline: [
    ["18:15–19:00", "CHECK-IN", "Đón khách, xác nhận tham gia và cùng làm quen với không gian chương trình."],
    ["19:00–19:15", "CHÀO SÂN & GIỚI THIỆU", "Mở đầu chương trình, kết nối mọi người và giới thiệu những nội dung chính của buổi gặp."],
    ["19:15–19:20", "VĂN NGHỆ MỞ ĐẦU", "Một tiết mục mang màu sắc quê hương để khởi động không khí của Hòa Âm Hỏa Ý."],
    ["19:20–19:30", "MINIGAME VĂN HÓA", "Cùng thử sức với những câu hỏi vui và khám phá thêm những nét đặc trưng của Bắc Ninh."],
    ["19:30–19:35", "NHỊP HIỆN ĐẠI", "Chuyển nhịp bằng một tiết mục trẻ trung, sôi động và giàu năng lượng."],
    ["19:35–19:45", "SÂN KHẤU GIAO LƯU", "Không gian dành cho những tiết mục và màu sắc riêng từ các bạn tham gia chương trình."],
    ["19:45–20:15", "HÒA GIỌNG CÙNG NHAU", "Mọi người cùng hát, cùng bắt nhịp và tạo nên một khoảnh khắc chung thật đáng nhớ."],
    ["20:15–20:45", "CHUỖI MINIGAME", "Cùng đồng đội vượt qua các thử thách vui, tương tác và khuấy động bầu không khí."],
    ["20:45–20:55", "TRAO QUÀ & LƯU KHOẢNH KHẮC", "Khép lại bằng phần trao quà, giao lưu nhẹ nhàng và lưu lại những bức ảnh chung."],
  ],
  questions: [
    { id: "fullName", label: "Họ và tên?", type: "text", required: true, placeholder: "Nguyễn Văn A", step: 1 },
    { id: "phone", label: "SĐT?", type: "tel", required: true, placeholder: "09xxxxxxxx", step: 1 },
    { id: "email", label: "Email?", type: "email", required: true, placeholder: "ban@example.com", step: 1 },
    { id: "school", label: "Em đang học ở đâu?", description: "Chọn một trường. Nếu là NEU, điền thêm MSV; nếu chọn Trường khác, ghi tên trường của em.", type: "radio", required: true, options: ["NEU", "HUST", "HUCE", "Trường khác"], step: 1 },
    { id: "facebook", label: "Link Facebook cá nhân?", type: "text", required: true, placeholder: "https://facebook.com/...", step: 1 },
    { id: "classMajor", label: "Lớp chuyên ngành?", type: "text", required: true, placeholder: "VD: K66 Kinh tế / IT1-02...", step: 2 },
    { id: "skills", label: "Em có kĩ năng, biệt tài hay sở thích gì không?", description: "VD: Biết chơi nhạc cụ, hát, nhảy,...", type: "textarea", required: true, placeholder: "Kể chúng mình nghe nhé...", step: 2 },
    { id: "performance", label: "Em có muốn đóng góp một tiết mục văn nghệ cho chương trình không?", type: "radio", required: true, options: ["Có", "Không"], step: 2 },
    { id: "note", label: "Em có điều gì thắc mắc hoặc muốn nhắn gửi tới anh chị không?", description: "Không bắt buộc", type: "textarea", placeholder: "Nhắn chúng mình bất cứ điều gì em muốn nhé 💙", step: 3 }
  ] as Question[]
};
