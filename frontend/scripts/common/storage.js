/* Local Storage, Import, and Export Operations */

const AppStorage = (() => {
  const STORAGE_KEY = "hyper_video_project";
  const SETTINGS_KEY = "hyper_video_settings";
  const OUTPUTS_KEY = "hyper_video_outputs";
  const ACTIVE_RENDER_KEY = "hyper_video_active_render";
  const DEFAULT_SETTINGS = {
    theme: "light",
    renderFolder: "outputs/",
    uploadFolder: "uploads/",
    validation: {
      warnMaxActiveScriptSegments: false,
      maxActiveScriptSegments: 6
    }
  };
  const HIEU1_FEATURE_CARD_ITEMS = [
    {
      id: "feat_1",
      type: "intro",
      name: "CodeGraph là bản đồ hiểu code",
      description: "Index file, symbol và call edge thành graph cục bộ để agent tra cứu nhanh bằng MCP.",
      benefit: "Agent có ngữ cảnh đúng trước khi sửa code, thay vì mở từng file bằng grep thủ công.",
      voiceoverScript: "CodeGraph là bản đồ symbol và call graph cục bộ giúp agent hiểu code nhanh hơn trước khi migrate.",
      durationSec: 8,
      useInVideo: true
    },
    {
      id: "feat_2",
      type: "problem",
      name: "G và S rất dễ đọc nhầm",
      description: "Project có nhiều class trùng tên, nên phải phân biệt đúng path như MgsV3 và MgsV4.",
      benefit: "Tránh lấy nhầm logic nguồn hoặc áp sai API vào bản đích.",
      voiceoverScript: "Khi migrate, điểm nguy hiểm là đọc nhầm giữa G và S vì nhiều class có tên giống nhau.",
      durationSec: 10,
      useInVideo: true
    },
    {
      id: "feat_3",
      type: "workflow",
      name: "Chọn đúng tool cho đúng câu hỏi",
      description: "Dùng explore để hiểu flow, search + node để mở symbol chính xác, callers/callees/impact để kiểm quan hệ gọi.",
      benefit: "Mỗi truy vấn có mục đích rõ, giảm việc đọc lan man và giảm sai context.",
      voiceoverScript: "Không phải case nào cũng grep. CodeGraph có explore, search, node, callers, callees và impact cho từng kiểu câu hỏi.",
      durationSec: 9,
      useInVideo: true
    },
    {
      id: "feat_4",
      type: "result",
      name: "Graph không thay thế build/test",
      description: "Sau khi sửa code, agent vẫn phải kiểm staleness, build, test và review diff.",
      benefit: "CodeGraph giúp định hướng nhanh, còn compiler và test mới xác nhận thay đổi đúng.",
      voiceoverScript: "CodeGraph giúp hiểu nhanh hơn, nhưng không thay thế build, test và review migration diff.",
      durationSec: 8,
      useInVideo: true
    }
  ];
  const HIEU1_VIDEO_SCENES = [
    {
      id: "scene_intro",
      type: "intro",
      name: "CodeGraph trong Migration Agent",
      description: "Bản đồ symbol và call graph giúp agent đọc đúng code trước khi migrate.",
      benefit: "Migration Agent",
      voiceoverScript: "CodeGraph là bản đồ symbol và call graph cục bộ giúp agent hiểu code nhanh hơn trước khi migrate.",
      durationSec: 6,
      useInVideo: true,
      sceneTemplateId: "intro-stack",
      slots: {
        logo: { type: "asset", assetId: "asset_1", delay: 0, animation: "scale-in", enabled: true },
        kicker: { type: "text", text: "PROJECT SHOWCASE", delay: 0, animation: "fade-up", enabled: true },
        title: { type: "text", text: "CodeGraph trong Migration Agent", delay: 0.4, animation: "fade-up", enabled: true },
        description: { type: "text", text: "Bản đồ symbol và call graph giúp agent đọc đúng code trước khi migrate.", delay: 1.5, animation: "fade-up", enabled: true },
        tag: { type: "tag", text: "Migration Agent", delay: 2.5, animation: "pop", enabled: true }
      }
    },
    {
      id: "scene_problem",
      type: "problem",
      name: "Vấn đề cần giải quyết",
      description: "Trong project Java NetBeans có nhiều class và method trùng tên giữa G và S. Nếu agent đọc nhầm path, logic migrate rất dễ lệch.",
      benefit: "Dùng khi cần hiểu feature, lần theo call flow, kiểm tra impact trước khi sửa hoặc xác nhận symbol đúng path.",
      voiceoverScript: "Khi migrate, điểm nguy hiểm là đọc nhầm giữa G và S vì nhiều class có tên giống nhau.",
      durationSec: 10,
      useInVideo: true,
      sceneTemplateId: "intro-stack",
      slots: {
        logo: { type: "asset", assetId: "asset_3", delay: 0, animation: "scale-in", enabled: true },
        kicker: { type: "text", text: "THỰC TRẠNG", delay: 0, animation: "fade-up", enabled: true },
        title: { type: "text", text: "Vấn đề cần giải quyết", delay: 0.4, animation: "fade-up", enabled: true },
        description: { type: "text", text: "Trong project Java NetBeans có nhiều class và method trùng tên giữa G và S. Nếu agent đọc nhầm path, logic migrate rất dễ lệch.", delay: 1.5, animation: "fade-up", enabled: true },
        tag: { type: "tag", text: "Migration risk", delay: 2.5, animation: "pop", enabled: true }
      }
    },
    {
      id: "scene_solution",
      type: "solution",
      name: "Cách sản phẩm tạo giá trị",
      description: "CodeGraph parse source bằng tree-sitter, tạo node/edge, lưu SQLite và expose các truy vấn qua MCP để agent hỏi đúng ngữ cảnh.",
      benefit: "CodeGraph tăng tốc đọc hiểu code, nhưng quyết định migrate cuối cùng vẫn phải theo style/API của bản S và được kiểm bằng build/test.",
      voiceoverScript: "CodeGraph parse source bằng tree-sitter, tạo node/edge, lưu SQLite và expose các truy vấn qua MCP để agent hỏi đúng ngữ cảnh.",
      durationSec: 10,
      useInVideo: true,
      sceneTemplateId: "intro-stack",
      slots: {
        logo: { type: "asset", assetId: "asset_2", delay: 0, animation: "scale-in", enabled: true },
        kicker: { type: "text", text: "GIẢI PHÁP", delay: 0, animation: "fade-up", enabled: true },
        title: { type: "text", text: "Cách sản phẩm tạo giá trị", delay: 0.4, animation: "fade-up", enabled: true },
        description: { type: "text", text: "CodeGraph parse source bằng tree-sitter, tạo node/edge, lưu SQLite và expose các truy vấn qua MCP để agent hỏi đúng ngữ cảnh.", delay: 1.5, animation: "fade-up", enabled: true },
        tag: { type: "tag", text: "MCP context", delay: 2.5, animation: "pop", enabled: true }
      }
    },
    {
      id: "scene_feature_cards",
      type: "features",
      name: "Các chức năng cốt lõi",
      description: "CodeGraph gom symbol, path, tool query và guardrail build/test thành một flow đọc hiểu code trước khi migrate.",
      benefit: "Không phải case nào cũng grep.",
      voiceoverScript: "Không phải case nào cũng grep. CodeGraph có explore, search, node, callers, callees và impact cho từng kiểu câu hỏi.",
      durationSec: 18,
      useInVideo: true,
      sceneTemplateId: "grid-feature",
      featureItems: HIEU1_FEATURE_CARD_ITEMS,
      slots: {
        header: { type: "text", text: "TÍNH NĂNG NỔI BẬT", delay: 0, animation: "fade-up", enabled: true },
        title: { type: "text", text: "Các chức năng cốt lõi", delay: 0.5, animation: "fade-up", enabled: true },
        grid: {
          type: "list",
          items: [
            "CodeGraph là bản đồ hiểu code",
            "G và S rất dễ đọc nhầm",
            "Chọn đúng tool cho đúng câu hỏi",
            "Graph không thay thế build/test"
          ],
          delay: 1.2,
          animation: "pop",
          enabled: true
        },
        description: { type: "text", text: "Index đúng context, query đúng tool, rồi vẫn kiểm chứng bằng build/test.", delay: 4, animation: "fade-up", enabled: true }
      }
    },
    {
      id: "scene_timeline",
      type: "timeline",
      name: "Các cột mốc quan trọng",
      description: "Link workspace, index graph, query đúng path, adapt vào S rồi build và review.",
      benefit: "Index đúng -> hỏi đúng -> adapt đúng.",
      voiceoverScript: "Quy trình nên đi từ link workspace, index graph, query đúng path, adapt vào S, rồi build và review.",
      durationSec: 14,
      useInVideo: true,
      sceneTemplateId: "step-flow",
      slots: {
        title: { type: "text", text: "Các cột mốc quan trọng", delay: 0, animation: "fade-up", enabled: true },
        steps: {
          type: "list",
          items: ["Link workspace", "Index graph", "Query đúng path", "Adapt vào S", "Build và review"],
          delay: 1,
          animation: "slide-left",
          enabled: true
        },
        note: { type: "text", text: "Đọc hiểu nhanh hơn, nhưng vẫn phải kiểm diff và test.", delay: 4, animation: "fade-up", enabled: true }
      }
    },
    {
      id: "scene_impact",
      type: "impact",
      name: "Kết quả đạt được",
      description: "Giảm thời gian mò file thủ công, giảm rủi ro copy nhầm logic G sang S và giúp review migration diff có cơ sở hơn.",
      benefit: "Giảm thời gian mò file",
      voiceoverScript: "CodeGraph giúp hiểu nhanh hơn, nhưng không thay thế build, test và review migration diff.",
      durationSec: 10,
      useInVideo: true,
      sceneTemplateId: "intro-stack",
      slots: {
        logo: { type: "asset", assetId: "asset_1", delay: 0, animation: "scale-in", enabled: true },
        kicker: { type: "text", text: "TÁC ĐỘNG", delay: 0, animation: "fade-up", enabled: true },
        title: { type: "text", text: "Kết quả đạt được", delay: 0.4, animation: "fade-up", enabled: true },
        description: { type: "text", text: "Giảm thời gian mò file thủ công, giảm rủi ro copy nhầm logic G sang S và giúp review migration diff có cơ sở hơn.", delay: 1.5, animation: "fade-up", enabled: true },
        tag: { type: "tag", text: "Giảm thời gian mò file", delay: 2.5, animation: "pop", enabled: true }
      }
    },
    {
      id: "scene_outro",
      type: "outro",
      name: "Cảm ơn đã theo dõi",
      description: "Dùng CodeGraph để giảm mù context, rồi vẫn phải build, test và review theo chuẩn migration.",
      benefit: "Migration Agent",
      voiceoverScript: "Dùng CodeGraph để giảm mù context, rồi vẫn phải build, test và review theo chuẩn migration.",
      durationSec: 6,
      useInVideo: true,
      sceneTemplateId: "outro-cta",
      slots: {
        logo: { type: "asset", assetId: "asset_1", delay: 0, animation: "scale-in", enabled: true },
        title: { type: "text", text: "Cảm ơn đã theo dõi", delay: 0.4, animation: "fade-up", enabled: true },
        cta: { type: "text", text: "Dùng CodeGraph để giảm mù context, rồi vẫn build/test/review.", delay: 1.5, animation: "pop", enabled: true },
        tag: { type: "tag", text: "Migration Agent", delay: 2.5, animation: "fade-up", enabled: true }
      }
    }
  ];

  // Embedded sample data keeps the static app clean under file:// and simple static servers.
  const STATIC_SAMPLE_DATA = {
    projectName: "CodeGraph trong Migration Agent",
    projectSlug: "codegraph-migration-agent",
    contentType: "technical-module",
    tagline: "Bản đồ symbol và call graph giúp agent đọc đúng code trước khi migrate.",
    ownerTeam: "Migration Agent",
    presenterRole: "Onboarding Guide",
    shortSummary: "CodeGraph index source code thành graph cục bộ để agent tra symbol, callers, callees và vùng impact qua MCP.",
    videoGoal: "Giúp người mới hiểu khi nào dùng CodeGraph, dùng tool nào và vì sao không nên grep thủ công mọi thứ.",
    mainMessage: "CodeGraph tăng tốc đọc hiểu code, nhưng quyết định migrate cuối cùng vẫn phải theo style/API của bản S và được kiểm bằng build/test.",
    contentTone: "technical",
    contentLanguage: "vi-VN",
    scriptDisplayMode: "sequence",
    primaryAssetId: "asset_2",
    problemContext: "Trong project Java NetBeans có nhiều class và method trùng tên giữa G và S. Nếu agent đọc nhầm path, logic migrate rất dễ lệch.",
    solutionWhat: "CodeGraph parse source bằng tree-sitter, tạo node/edge, lưu SQLite và expose các truy vấn qua MCP để agent hỏi đúng ngữ cảnh.",
    targetUsers: "Agent hoặc developer đang migrate logic từ bản G sang bản S trong Migration Agent.",
    useCase: "Dùng khi cần hiểu feature, lần theo call flow, kiểm tra impact trước khi sửa hoặc xác nhận symbol đúng path.",
    keyHighlight: "Ưu tiên dùng explore để đọc một vùng/luồng chính; dùng search + node khi tên bị trùng; dùng callers/callees/impact để kiểm tra quan hệ gọi.",
    resultImpact: "Giảm thời gian mò file thủ công, giảm rủi ro copy nhầm logic G sang S và giúp review migration diff có cơ sở hơn.",
    endingNote: "Dùng CodeGraph để giảm mù context, rồi vẫn phải build, test và review theo chuẩn migration.",
    features: HIEU1_VIDEO_SCENES,
    milestones: [
      {
        id: "ms_1",
        name: "Link workspace",
        date: "Bước 1",
        description: "Trỏ hoặc symlink đúng project để CodeGraph nhìn thấy source cần index.",
        status: "completed"
      },
      {
        id: "ms_2",
        name: "Index graph",
        date: "Bước 2",
        description: "Build graph từ source trước khi truy vấn symbol hoặc call flow.",
        status: "completed"
      },
      {
        id: "ms_3",
        name: "Query đúng path",
        date: "Bước 3",
        description: "Xác nhận đang đọc MgsV3 hay MgsV4 để không nhầm nguồn G và đích S.",
        status: "completed"
      },
      {
        id: "ms_4",
        name: "Adapt vào S",
        date: "Bước 4",
        description: "Mang logic cần thiết sang S nhưng giữ style, API và convention của S.",
        status: "active"
      },
      {
        id: "ms_5",
        name: "Build và review",
        date: "Bước 5",
        description: "Chạy compiler/test, kiểm diff và cập nhật lại graph nếu source đã đổi.",
        status: "upcoming"
      }
    ],
    assets: [
      {
        id: "asset_1",
        name: "codegraph_symbol_map.png",
        type: "logo",
        size: "45 KB",
        dateAdded: "2026-06-24",
        url: "https://placehold.co/120x120/1f4fd8/ffffff?text=CG",
        useInVideo: true
      },
      {
        id: "asset_2",
        name: "codegraph_flow_preview.png",
        type: "screenshot",
        size: "1.2 MB",
        dateAdded: "2026-06-24",
        url: "https://placehold.co/1920x1080/1c1f24/ffffff?text=File+Symbol+Call+Edge",
        useInVideo: true
      },
      {
        id: "asset_3",
        name: "migration_path_check.png",
        type: "screenshot",
        size: "850 KB",
        dateAdded: "2026-06-24",
        url: "https://placehold.co/1920x1080/1c1f24/ffffff?text=MgsV3+to+MgsV4",
        useInVideo: true
      }
    ],
    videoStyleId: "dark-tech",
    videoStyleOverrides: {},
    defaultSceneTemplateId: "intro-stack",
    sceneItemViews: [],
    templateId: "dynamic-story-vertical",
    templateConfig: {
      theme: "dark",
      accentColor: "blue",
      fontSize: "default",
      logoPosition: "top-left"
    },
    video: {
      formatId: "dynamic-story-vertical",
      fps: 30,
      outputFilename: "codegraph-migration-agent_video.mp4"
    }
  };

  const loadLocalData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      const normalizeVideoTemplate = (projectData = {}) => {
        const formats = Array.isArray(RENDER_FORMATS) ? RENDER_FORMATS : [];
        const selectedFormat = formats.find((format) => format.id === (projectData.video && projectData.video.formatId))
          || formats.find((format) => format.aspectRatio === (projectData.video && projectData.video.aspectRatio))
          || formats.find((format) => format.templateId === projectData.templateId)
          || null;
        if (!selectedFormat || projectData.templateId === selectedFormat.templateId) {
          return projectData;
        }
        return {
          ...projectData,
          templateId: selectedFormat.templateId
        };
      };
      const parsed = normalizeVideoTemplate(JSON.parse(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error("Lỗi khi load local data:", e);
      return null;
    }
  };

  const saveLocalData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      AppState.setDirty(false);
      return true;
    } catch (e) {
      console.error("Lỗi khi lưu local data:", e);
      return false;
    }
  };

  const loadSettings = () => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        validation: {
          ...DEFAULT_SETTINGS.validation,
          ...(parsed.validation || {})
        }
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
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

  const loadActiveRenderJob = () => {
    try {
      const data = localStorage.getItem(ACTIVE_RENDER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  const saveActiveRenderJob = (job) => {
    try {
      localStorage.setItem(ACTIVE_RENDER_KEY, JSON.stringify(job));
    } catch (e) {}
  };

  const clearActiveRenderJob = () => {
    try {
      localStorage.removeItem(ACTIVE_RENDER_KEY);
    } catch (e) {}
  };

  const loadSampleData = () => {
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
    loadActiveRenderJob,
    saveActiveRenderJob,
    clearActiveRenderJob,
    loadSampleData,
    exportProjectJSON,
    clearLocalData
  };
})();
