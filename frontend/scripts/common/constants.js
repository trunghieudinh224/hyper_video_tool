/* Global Constants */

const INITIAL_PROJECT_DATA = {
  projectName: "",
  projectSlug: "",
  contentType: "feature",
  tagline: "",
  ownerTeam: "",
  presenterRole: "",
  shortSummary: "",
  videoGoal: "",
  mainMessage: "",
  contentTone: "technical",
  contentLanguage: "vi-VN",
  primaryAssetId: "",
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

const VIDEO_CONTENT_TYPES = [
  { id: "feature", label: "Tính năng" },
  { id: "product", label: "Sản phẩm" },
  { id: "workflow", label: "Workflow" },
  { id: "technical-module", label: "Module kỹ thuật" },
  { id: "ui-demo", label: "Demo UI" },
  { id: "bug-fix", label: "Bug fix" },
  { id: "report", label: "Báo cáo" },
  { id: "handoff", label: "Handoff" },
  { id: "other", label: "Khác" }
];

const VIDEO_TONES = [
  { id: "technical", label: "Kỹ thuật" },
  { id: "internal", label: "Nội bộ" },
  { id: "presentation", label: "Thuyết trình" },
  { id: "concise", label: "Ngắn gọn" },
  { id: "soft-sales", label: "Bán hàng nhẹ" },
  { id: "training", label: "Training" }
];

const VIDEO_SEGMENT_TYPES = [
  { id: "intro", label: "Mở đầu" },
  { id: "problem", label: "Bối cảnh" },
  { id: "solution", label: "Cách xử lý" },
  { id: "feature", label: "Tính năng" },
  { id: "workflow", label: "Workflow step" },
  { id: "demo", label: "Demo" },
  { id: "milestone", label: "Cột mốc" },
  { id: "result", label: "Kết quả" },
  { id: "outro", label: "Kết thúc" },
  { id: "custom", label: "Custom" }
];

const TEMPLATES_LIST = [
  {
    id: "project-showcase-90s",
    name: "Video brief 90 giây (Ngang 16:9)",
    ratio: "16:9",
    duration: "60-90 giây",
    desc: "Phù hợp để giới thiệu nhanh tiến độ, ý tưởng và kết quả của các dự án nội bộ trong công ty.",
    bestFor: "Demo nội bộ, handoff, giới thiệu nhanh",
    scenes: [
      { id: "intro", title: "Mở đầu", duration: "10s", desc: "Tên dự án, logo, tagline và team phát triển." },
      { id: "problem", title: "Vấn đề", duration: "15s", desc: "Nêu bối cảnh và nỗi đau cần giải quyết." },
      { id: "solution", title: "Giải pháp", duration: "15s", desc: "Dashboard hoặc hệ thống giải quyết vấn đề thế nào." },
      { id: "features", title: "Kịch bản chính", duration: "20s", desc: "Showcase các đoạn nội dung tiêu biểu có hình minh họa." },
      { id: "timeline", title: "Cột mốc tùy chọn", duration: "12s", desc: "Các mốc quan trọng nếu video cần kể tiến trình." },
      { id: "impact", title: "Kết quả & Tác động", duration: "10s", desc: "Chỉ số thực tế hoặc giá trị mang lại." },
      { id: "outro", title: "Kết thúc (CTA)", duration: "8s", desc: "Thông điệp kết thúc, URL và lời kêu gọi đóng góp." }
    ]
  },
  {
    id: "project-showcase-vertical-60s",
    name: "Video ngắn 60 giây (Dọc 9:16)",
    ratio: "9:16",
    duration: "50-60 giây",
    desc: "Phù hợp làm Reels, TikTok, Shorts để chia sẻ nhanh trên di động, định dạng dọc hiện đại.",
    bestFor: "TikTok, Reels, Shorts, Mobile view",
    scenes: [
      { id: "intro", title: "Mở đầu", duration: "6s", desc: "Tên dự án, logo và tagline bắt mắt." },
      { id: "problem", title: "Vấn đề", duration: "10s", desc: "Khó khăn cốt lõi của người dùng." },
      { id: "solution", title: "Giải pháp", duration: "12s", desc: "Ứng dụng giải quyết thế nào." },
      { id: "features", title: "Tính năng chính", duration: "18s", desc: "Giới thiệu các tính năng độc đáo." },
      { id: "impact", title: "Kết quả", duration: "8s", desc: "Tác động thực tế và giá trị mang lại." },
      { id: "outro", title: "Kêu gọi hành động", duration: "6s", desc: "Lời kết và CTA truy cập." }
    ]
  },
  {
    id: "tech-deep-dive-120s",
    name: "Tech Deep Dive 120 giây (Ngang 16:9)",
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
  },
  {
    id: "dynamic-story-vertical",
    label: "Dọc dynamic motion - 1080x1920",
    aspectRatio: "9:16",
    resolution: "1080x1920",
    width: 1080,
    height: 1920,
    templateId: "dynamic-story-vertical",
    templateName: "Dynamic Story Vertical",
    payloadType: "dynamic-motion"
  },
  {
    id: "dynamic-story-horizontal",
    label: "Ngang dynamic motion - 1920x1080",
    aspectRatio: "16:9",
    resolution: "1920x1080",
    width: 1920,
    height: 1080,
    templateId: "dynamic-story-horizontal",
    templateName: "Dynamic Story Horizontal",
    payloadType: "dynamic-motion"
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
