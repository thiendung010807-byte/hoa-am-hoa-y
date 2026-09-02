export type QuestionType = "text" | "textarea" | "email" | "tel" | "number" | "radio" | "checkbox" | "select" | "yesno" | "rating" | "scale";
export type Question = { id: string; label: string; description?: string; type: QuestionType; required?: boolean; placeholder?: string; options?: string[]; allowOther?: boolean; step: 1 | 2 | 3 };

export const event = {
  name: "HÒA ÂM HỎA Ý",
  organization: "ĐỘI SINH VIÊN TÌNH NGUYỆN ĐỒNG HƯƠNG BẮC NINH",
  tagline: "Mỗi người một thanh âm. Khi cùng bắt nhịp, chúng ta tạo nên một ngọn lửa rất riêng.",
  // Đổi ngày thật tại đây. ISO +07:00 để countdown chính xác giờ Việt Nam.
  date: "2026-09-20T17:30:00+07:00",
  dateLabel: "Chủ nhật, 20/09/2026",
  timeLabel: "17:30 – 21:00",
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
    ["17:30", "CHECK-IN", "Ghé bàn check-in, nhận sticker và tìm team của bạn."],
    ["18:00", "LÀM QUEN", "Phá băng bằng những thử thách nhỏ, vui và dễ bắt chuyện."],
    ["18:20", "ICE BREAKING", "Đủ năng lượng để mọi khoảng cách biến mất."],
    ["18:45", "TEAM GAME", "Chơi theo đội, cùng phối hợp và tạo những chiếc moment đầu tiên."],
    ["19:30", "CHIA SẺ VỀ ĐỘI", "Biết thêm về hành trình, con người và tinh thần của Đội."],
    ["20:00", "MINI GAME", "Một chút bất ngờ và quà nhỏ cho những người nhanh tay."],
    ["20:30", "CHỤP ẢNH", "Lưu lại khung hình đầu tiên của chúng mình."],
    ["21:00", "SEE YOU AGAIN 💙", "Hẹn nhau ở những hành trình tiếp theo."],
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
