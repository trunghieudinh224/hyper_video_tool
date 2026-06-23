/* Global Constants */

const INITIAL_PROJECT_DATA = {
  projectName: "",
  projectSlug: "",
  tagline: "",
  ownerTeam: "",
  presenterRole: "",
  shortSummary: "",
  problemContext: "",
  solutionWhat: "",
  targetUsers: "",
  useCase: "",
  keyHighlight: "",
  resultImpact: "",
  endingNote: "",
  features: [],
  milestones: [],
  assets: [],
  templateId: "project-showcase-90s",
  templateConfig: {
    theme: "dark",
    accentColor: "blue",
    fontSize: "default",
    logoPosition: "top-left"
  },
  audio: {
    voiceover: {
      enabled: false,
      provider: "edge-tts",
      language: "vi-VN",
      voiceId: "vi-VN-HoaiMyNeural",
      rate: "+0%",
      volume: "+0%",
      script: "",
      outputPath: ""
    }
  },
  voiceover: {
    sceneScripts: {
      intro: "",
      problem: "",
      solution: "",
      features: "",
      timeline: "",
      impact: "",
      outro: ""
    }
  }
};

const TEMPLATES_LIST = [
  {
    id: "project-showcase-90s",
    name: "Giới thiệu dự án 90 giây",
    ratio: "16:9",
    duration: "60-90 giây",
    desc: "Phù hợp để giới thiệu nhanh tiến độ, ý tưởng và kết quả của các dự án nội bộ trong công ty.",
    bestFor: "Dự án nội bộ, MVP giới thiệu nhanh",
    scenes: [
      { id: "intro", title: "Mở đầu", duration: "10s", desc: "Tên dự án, logo, tagline và team phát triển." },
      { id: "problem", title: "Vấn đề", duration: "15s", desc: "Nêu bối cảnh và nỗi đau cần giải quyết." },
      { id: "solution", title: "Giải pháp", duration: "15s", desc: "Dashboard hoặc hệ thống giải quyết vấn đề thế nào." },
      { id: "features", title: "Tính năng chính", duration: "20s", desc: "Showcase các tính năng tiêu biểu có hình minh họa." },
      { id: "timeline", title: "Cột mốc Timeline", duration: "12s", desc: "Lịch sử phát triển và các cột mốc quan trọng." },
      { id: "impact", title: "Kết quả & Tác động", duration: "10s", desc: "Chỉ số thực tế hoặc giá trị mang lại." },
      { id: "outro", title: "Kết thúc (CTA)", duration: "8s", desc: "Thông điệp kết thúc, URL và lời kêu gọi đóng góp." }
    ]
  },
  {
    id: "tech-deep-dive-120s",
    name: "Tech Deep Dive 120 giây",
    ratio: "16:9",
    duration: "100-120 giây",
    desc: "Mô tả sâu về kiến trúc hệ thống, tech stack và quy trình triển khai kỹ thuật.",
    bestFor: "Tech demo, chia sẻ kiến trúc hệ thống",
    scenes: [
      { id: "intro", title: "Mở đầu", duration: "10s", desc: "Giới thiệu chủ đề kỹ thuật." },
      { id: "architecture", title: "Kiến trúc hệ thống", duration: "30s", desc: "Sơ đồ khối và luồng dữ liệu." },
      { id: "tech_stack", title: "Công nghệ cốt lõi", duration: "20s", desc: "Danh sách ngôn ngữ, framework sử dụng." },
      { id: "demo", title: "Demo kỹ thuật", duration: "35s", desc: "Xem trước code hoặc terminal run." },
      { id: "outro", title: "Lời kết", duration: "15s", desc: "Hỏi đáp hoặc đóng góp repo." }
    ]
  }
];

const RENDER_FORMATS = [
  {
    id: "landscape-16x9",
    label: "Ngang 16:9 - 1920x1080",
    aspectRatio: "16:9",
    resolution: "1920x1080",
    width: 1920,
    height: 1080,
    templateId: "project-showcase-90s",
    templateName: "Showcase 90s"
  },
  {
    id: "vertical-9x16",
    label: "Dọc 9:16 - 1080x1920",
    aspectRatio: "9:16",
    resolution: "1080x1920",
    width: 1080,
    height: 1920,
    templateId: "project-showcase-vertical-60s",
    templateName: "Showcase Vertical 60s"
  }
];

const VOICEOVER_LANGUAGES = [
  { id: "vi-VN", label: "Tiếng Việt" },
  { id: "en-US", label: "English" },
  { id: "ja-JP", label: "日本語" }
];

const VOICEOVER_VOICES = {
  "vi-VN": [
    { id: "vi-VN-HoaiMyNeural", label: "Hoai My" },
    { id: "vi-VN-NamMinhNeural", label: "Nam Minh" }
  ],
  "en-US": [
    { id: "en-US-JennyNeural", label: "Jenny" },
    { id: "en-US-GuyNeural", label: "Guy" }
  ],
  "ja-JP": [
    { id: "ja-JP-NanamiNeural", label: "Nanami" },
    { id: "ja-JP-KeitaNeural", label: "Keita" }
  ]
};

const THEME_ACCENT_COLORS = [
  { id: "blue", name: "Xanh chuyên nghiệp", value: "#1f4fd8" },
  { id: "gray", name: "Xám trung tính", value: "#5f6b7a" },
  { id: "green", name: "Xanh lá nhẹ", value: "#16803c" },
  { id: "orange", name: "Cam cảnh báo nhẹ", value: "#c2410c" }
];
