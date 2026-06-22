/* Local Storage, Import, and Export Operations */

const AppStorage = (() => {
  const STORAGE_KEY = "hyper_video_project";
  const SETTINGS_KEY = "hyper_video_settings";
  const OUTPUTS_KEY = "hyper_video_outputs";

  // Embedded sample data keeps the static app clean under file:// and simple static servers.
  const STATIC_SAMPLE_DATA = {
    projectName: "Internal Analytics Dashboard",
    projectSlug: "internal-analytics-dashboard",
    tagline: "Bảng điều khiển giúp team theo dõi hiệu suất dự án theo thời gian thực.",
    ownerTeam: "Platform Team",
    presenterRole: "Product Owner",
    shortSummary: "Hệ thống tổng hợp và trực quan hóa dữ liệu hiệu suất của các dự án đang chạy trong công ty.",
    problemContext: "Dữ liệu tiến độ nằm rải rác nhiều nguồn, khó nhìn tổng quan khiến việc đưa ra quyết định chậm trễ.",
    solutionWhat: "Gom dữ liệu vào dashboard nội bộ có biểu đồ trực quan, hệ thống cảnh báo tự động và báo cáo nhanh.",
    targetUsers: "Quản lý dự án, team lead và các thành viên vận hành nội bộ.",
    useCase: "Sử dụng trong các buổi họp tiến độ hàng tuần và báo cáo tháng của các bộ phận.",
    keyHighlight: "Tự động gửi cảnh báo qua Slack/Email khi có task trễ hạn quá 2 ngày.",
    resultImpact: "Giảm 70% thời gian tổng hợp báo cáo thủ công và tăng 25% hiệu suất xử lý công việc quá hạn.",
    endingNote: "Hãy truy cập dashboard tại internal.analytics và gửi phản hồi cho Platform Team nhé!",
    features: [
      {
        id: "feat_1",
        name: "Tổng quan tiến độ theo dự án",
        description: "Hiển thị tỷ lệ phần trăm hoàn thành, trạng thái các milestone và timeline của từng dự án.",
        benefit: "Giúp quản lý nắm bắt nhanh trạng thái sức khỏe của toàn bộ dự án trong 10 giây.",
        useInVideo: true
      },
      {
        id: "feat_2",
        name: "Biểu đồ hiệu suất theo tuần",
        description: "Biểu diễn trực quan số lượng task hoàn thành, task mới phát sinh và task tồn đọng.",
        benefit: "Phát hiện ngay các điểm nghẽn trong quy trình làm việc của team.",
        useInVideo: true
      },
      {
        id: "feat_3",
        name: "Cảnh báo task trễ hạn tự động",
        description: "Tự động quét và phát hiện các task đã quá deadline mà chưa được cập nhật.",
        benefit: "Hỗ trợ team lead xử lý rủi ro chậm tiến độ một cách chủ động.",
        useInVideo: true
      },
      {
        id: "feat_4",
        name: "Xuất báo cáo nhanh cho buổi họp",
        description: "Chỉ với 1 click, hệ thống tự động xuất báo cáo PDF/Slides tóm tắt các chỉ số quan trọng.",
        benefit: "Tiết kiệm thời gian chuẩn bị tài liệu họp cho team hàng tuần.",
        useInVideo: true
      }
    ],
    milestones: [
      {
        id: "ms_1",
        name: "Khảo sát nhu cầu nội bộ",
        date: "Tháng 01/2026",
        description: "Phỏng vấn 15 PM và Team Lead để xác định các chỉ số quan trọng cần theo dõi.",
        status: "completed"
      },
      {
        id: "ms_2",
        name: "Xây dựng bản MVP",
        date: "Tháng 02/2026",
        description: "Thiết kế database, tích hợp API từ Jira/Github và dựng các biểu đồ cốt lõi.",
        status: "completed"
      },
      {
        id: "ms_3",
        name: "Thử nghiệm nội bộ (Alpha Test)",
        date: "Tháng 03/2026",
        description: "Triển khai thử nghiệm cho Platform Team để tìm và sửa lỗi phát sinh.",
        status: "completed"
      },
      {
        id: "ms_4",
        name: "Mở rộng thử nghiệm (Beta Test)",
        date: "Tháng 04/2026",
        description: "Mở quyền truy cập cho 5 team dự án khác chạy thử và thu thập feedback.",
        status: "active"
      },
      {
        id: "ms_5",
        name: "Ra mắt chính thức bản V1.0",
        date: "Tháng 05/2026",
        description: "Hoàn thiện các tính năng báo cáo tự động và triển khai diện rộng toàn công ty.",
        status: "upcoming"
      }
    ],
    assets: [
      {
        id: "asset_1",
        name: "logo_platform_team.svg",
        type: "logo",
        size: "45 KB",
        dateAdded: "2026-06-20",
        url: "https://placehold.co/120x120/1f4fd8/ffffff?text=Platform+Logo",
        useInVideo: true
      },
      {
        id: "asset_2",
        name: "dashboard_overview.png",
        type: "screenshot",
        size: "1.2 MB",
        dateAdded: "2026-06-21",
        url: "https://placehold.co/1920x1080/1c1f24/ffffff?text=Dashboard+Overview",
        useInVideo: true
      },
      {
        id: "asset_3",
        name: "weekly_performance_chart.png",
        type: "screenshot",
        size: "850 KB",
        dateAdded: "2026-06-21",
        url: "https://placehold.co/1920x1080/1c1f24/ffffff?text=Performance+Chart",
        useInVideo: true
      }
    ],
    templateId: "project-showcase-90s",
    templateConfig: {
      theme: "dark",
      accentColor: "blue",
      fontSize: "default",
      logoPosition: "top-left"
    }
  };

  const loadLocalData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Lỗi khi load local data:", e);
      return null;
    }
  };

  const saveLocalData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      AppState.setDirty(false);
    } catch (e) {
      console.error("Lỗi khi lưu local data:", e);
    }
  };

  const loadSettings = () => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { theme: "light", renderFolder: "outputs/", uploadFolder: "uploads/" };
    } catch (e) {
      return { theme: "light", renderFolder: "outputs/", uploadFolder: "uploads/" };
    }
  };

  const saveSettings = (settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  };

  const loadOutputs = () => {
    try {
      const data = localStorage.getItem(OUTPUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveOutputs = (outputs) => {
    try {
      localStorage.setItem(OUTPUTS_KEY, JSON.stringify(outputs));
    } catch (e) {}
  };

  const loadSampleData = async () => {
    return JSON.parse(JSON.stringify(STATIC_SAMPLE_DATA));
  };

  const exportProjectJSON = (data) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const filename = (data.projectSlug || "project") + "-backup.json";
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const clearLocalData = () => {
    localStorage.removeItem(STORAGE_KEY);
    AppState.setProjectData(JSON.parse(JSON.stringify(INITIAL_PROJECT_DATA)));
  };

  return {
    loadLocalData,
    saveLocalData,
    loadSettings,
    saveSettings,
    loadOutputs,
    saveOutputs,
    loadSampleData,
    exportProjectJSON,
    clearLocalData
  };
})();
