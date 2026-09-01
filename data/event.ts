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
    { id: "fullName", label: "Bạn tên là gì?", type: "text", required: true, placeholder: "Nguyễn Văn A", step: 1 },
    { id: "phone", label: "Số điện thoại", type: "tel", required: true, placeholder: "09xxxxxxxx", step: 1 },
    { id: "email", label: "Email", type: "email", required: true, placeholder: "ban@example.com", step: 1 },
    { id: "school", label: "Bạn đang học/làm việc ở đâu?", type: "text", required: true, placeholder: "Tên trường / đơn vị", step: 1 },
    { id: "year", label: "Bạn đang là sinh viên năm mấy?", type: "radio", required: true, options: ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Khác"], allowOther: true, step: 2 },
    { id: "source", label: "Bạn biết Hòa Âm Hỏa Ý qua đâu?", type: "radio", required: true, options: ["Facebook", "Bạn bè", "TikTok", "Group trường", "Khác"], allowOther: true, step: 2 },
    { id: "expectation", label: "Bạn mong chờ điều gì nhất ở Hòa Âm Hỏa Ý?", type: "textarea", required: true, placeholder: "Kể chúng mình nghe một chút nhé...", step: 2 },
    { id: "joinFuture", label: "Bạn có muốn nhận thông tin các hoạt động tiếp theo của Đội không?", type: "yesno", required: true, step: 3 },
    { id: "note", label: "Có điều gì bạn muốn nhắn với BTC không?", type: "textarea", placeholder: "Không bắt buộc đâu nha 💙", step: 3 }
  ] satisfies Question[]
};
