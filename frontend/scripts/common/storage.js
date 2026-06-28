/* Local Storage, Import, and Export Operations */

const AppStorage = (() => {
  const STORAGE_KEY = "hyper_video_project";
  const SETTINGS_KEY = "hyper_video_settings";
  const OUTPUTS_KEY = "hyper_video_outputs";
  const ACTIVE_RENDER_KEY = "hyper_video_active_render";
  const BACKEND_SAVE_DEBOUNCE_MS = 500;
  let backendSaveTimer = null;
  const DEFAULT_SETTINGS = {
    theme: "light",
    renderFolder: "outputs/",
    uploadFolder: "uploads/",
    validation: {
      warnMaxActiveScriptSegments: false,
      maxActiveScriptSegments: 6
    }
  };
  let settingsCache = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  // Embedded sample data keeps the static app clean under file:// and simple static servers.
  const STATIC_SAMPLE_DATA = {
    "projectName": "Codegraph cho AI Agent",
    "projectSlug": "codegraph-ai-agent-intro",
    "contentType": "technical-module",
    "tagline": "Bản đồ symbol và call graph giúp agent hiểu codebase trước khi sửa.",
    "ownerTeam": "Codegraph",
    "presenterRole": "Developer Tooling Guide",
    "shortSummary": "Codegraph là lớp code intelligence cục bộ: parse source thành graph, cho agent query symbol, caller/callee, dependency path và impact nhanh hơn đọc file thủ công.",
    "videoGoal": "Giới thiệu Codegraph như một công cụ giúp AI agent và developer hiểu codebase nhanh, có ngữ cảnh và ít đoán mò hơn.",
    "mainMessage": "Thay vì bắt agent grep và mở file lan man, Codegraph cho agent hỏi trực tiếp vào bản đồ cấu trúc code.",
    "contentTone": "technical",
    "contentLanguage": "vi-VN",
    "scriptDisplayMode": "sequence",
    "primaryAssetId": "asset_codegraph_map",
    "problemContext": "Khi codebase lớn, chỉ tìm text là không đủ. Một tên hàm có thể xuất hiện ở nhiều nơi, flow có thể đi qua nhiều lớp, và agent dễ đọc thiếu context trước khi sửa.",
    "solutionWhat": "Codegraph index source code thành knowledge graph cục bộ gồm file, symbol, định nghĩa, caller/callee và quan hệ phụ thuộc. Agent dùng tool query graph để đọc đúng vùng code cần hiểu.",
    "targetUsers": "AI coding agent, developer đang onboarding codebase lớn, hoặc team cần phân tích impact trước khi refactor.",
    "useCase": "Dùng khi cần hiểu một module, tìm symbol chính xác, lần theo flow gọi hàm, kiểm tra impact thay đổi, hoặc trả lời câu hỏi kiến trúc từ source thật.",
    "keyHighlight": "Codegraph không thay thế compiler/test; nó giảm thời gian tìm hiểu code và làm agent hỏi đúng câu hỏi hơn.",
    "resultImpact": "Agent đọc ít file hơn, giữ context tốt hơn, xác định blast radius rõ hơn và giảm rủi ro sửa code dựa trên suy đoán.",
    "endingNote": "Dùng Codegraph để hiểu nhanh. Dùng test, typecheck và review để xác nhận thay đổi đúng.",
    "features": [
      {
        "id": "scene_intro_codegraph",
        "type": "intro",
        "name": "Codegraph là gì?",
        "description": "Một knowledge graph cục bộ của codebase, được tối ưu để agent hỏi về symbol, flow và impact.",
        "benefit": "Code intelligence cho agent",
        "voiceoverScript": "Codegraph là bản đồ cấu trúc của codebase, giúp AI agent hiểu symbol, flow và impact trước khi sửa code.",
        "durationSec": 7,
        "useInVideo": true,
        "sceneTemplateId": "intro-stack",
        "slots": {
          "logo": {
            "type": "asset",
            "assetId": "asset_codegraph_logo",
            "delay": 0,
            "animation": "scale-in",
            "enabled": true
          },
          "kicker": {
            "type": "text",
            "text": "CODE INTELLIGENCE",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Codegraph cho AI Agent",
            "delay": 0.4,
            "animation": "typewriter",
            "enabled": true
          },
          "description": {
            "type": "text",
            "text": "Bản đồ symbol và call graph giúp agent hiểu codebase trước khi sửa.",
            "delay": 1.5,
            "animation": "fade-up",
            "enabled": true
          },
          "tag": {
            "type": "tag",
            "text": "Local code graph",
            "delay": 2.5,
            "animation": "pop",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_problem_text_search",
        "type": "problem",
        "name": "Vì sao grep chưa đủ?",
        "description": "Text search tìm được chuỗi, nhưng không hiểu symbol nào là định nghĩa thật, ai gọi ai, và thay đổi này ảnh hưởng tới đâu.",
        "benefit": "Giảm đọc nhầm context",
        "voiceoverScript": "Trong codebase lớn, grep chỉ cho kết quả text. Nó không cho biết định nghĩa thật, call flow hay blast radius của thay đổi.",
        "durationSec": 8,
        "useInVideo": true,
        "sceneTemplateId": "intro-stack",
        "slots": {
          "logo": {
            "type": "asset",
            "assetId": "asset_codegraph_map",
            "delay": 0,
            "animation": "scale-in",
            "enabled": true
          },
          "kicker": {
            "type": "text",
            "text": "VẤN ĐỀ",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Grep tìm chữ, không hiểu flow",
            "delay": 0.4,
            "animation": "fade-up",
            "enabled": true
          },
          "description": {
            "type": "text",
            "text": "Agent cần biết symbol thật, caller/callee và impact — không chỉ danh sách file chứa cùng một chuỗi.",
            "delay": 1.5,
            "animation": "fade-up",
            "enabled": true
          },
          "tag": {
            "type": "tag",
            "text": "Context risk",
            "delay": 2.5,
            "animation": "pop",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_solution_graph",
        "type": "solution",
        "name": "Codegraph tạo bản đồ code",
        "description": "Source được parse thành node và edge: file, class, function, method, import, definition, caller/callee và dependency relation.",
        "benefit": "Graph thay cho đọc mò",
        "voiceoverScript": "Codegraph parse source thành graph gồm file, symbol và quan hệ. Vì vậy agent có thể hỏi thẳng vào cấu trúc code.",
        "durationSec": 8,
        "useInVideo": true,
        "sceneTemplateId": "media-showcase",
        "slots": {
          "header": {
            "type": "text",
            "text": "CÁCH HOẠT ĐỘNG",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "logo": {
            "type": "asset",
            "assetId": "asset_codegraph_logo",
            "delay": 0,
            "animation": "scale-in",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Parse source thành knowledge graph",
            "delay": 0.6,
            "animation": "fade-up",
            "enabled": true
          },
          "media": {
            "type": "media",
            "assetId": "asset_codegraph_map",
            "delay": 1.4,
            "animation": "scale-in",
            "enabled": true
          },
          "description": {
            "type": "text",
            "text": "Node là symbol. Edge là quan hệ. Query trả về đúng phần code cần đọc.",
            "delay": 3,
            "animation": "fade-up",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_toolbox",
        "type": "feature",
        "name": "Bộ tool agent dùng hằng ngày",
        "description": "Explore để hiểu khu vực code, search/node để mở symbol, callers/callees để lần flow, impact để kiểm tra phạm vi ảnh hưởng.",
        "benefit": "Chọn đúng tool theo câu hỏi",
        "voiceoverScript": "Agent dùng explore để hiểu một khu vực, search và node để mở symbol, callers và callees để lần flow, impact để kiểm tra phạm vi ảnh hưởng.",
        "durationSec": 11,
        "useInVideo": true,
        "sceneTemplateId": "grid-feature",
        "slots": {
          "header": {
            "type": "text",
            "text": "TOOLBOX",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Hỏi codebase bằng graph",
            "delay": 0.5,
            "animation": "fade-up",
            "enabled": true
          },
          "grid": {
            "type": "list",
            "items": [
              "explore: hiểu một module hoặc flow",
              "search/node: tìm đúng symbol",
              "callers/callees: lần quan hệ gọi",
              "impact: xem thay đổi ảnh hưởng đâu"
            ],
            "delay": 1.2,
            "animation": "pop",
            "enabled": true
          },
          "description": {
            "type": "text",
            "text": "Mục tiêu không phải đọc nhiều file hơn, mà là đọc đúng file hơn.",
            "delay": 4,
            "animation": "fade-up",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_workflow",
        "type": "workflow",
        "name": "Workflow dùng Codegraph",
        "description": "Bắt đầu bằng câu hỏi, explore khu vực liên quan, inspect symbol chính, kiểm caller/callee, rồi mới sửa và verify bằng test.",
        "benefit": "Hiểu trước, sửa sau",
        "voiceoverScript": "Workflow an toàn là đặt câu hỏi, explore vùng liên quan, inspect symbol chính, kiểm caller callee và impact, rồi mới sửa code.",
        "durationSec": 10,
        "useInVideo": true,
        "sceneTemplateId": "step-flow",
        "slots": {
          "title": {
            "type": "text",
            "text": "Workflow: hỏi đúng trước khi sửa",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "steps": {
            "type": "list",
            "items": [
              "1. Đặt câu hỏi về module/bug",
              "2. Explore vùng code liên quan",
              "3. Inspect symbol chính",
              "4. Check callers/callees/impact",
              "5. Sửa code và chạy verification"
            ],
            "delay": 1,
            "animation": "slide-left",
            "enabled": true
          },
          "note": {
            "type": "text",
            "text": "Codegraph là bước đọc hiểu. Verification vẫn là compiler, test và review.",
            "delay": 4,
            "animation": "fade-up",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_guardrails",
        "type": "result",
        "name": "Guardrail khi dùng Codegraph",
        "description": "Graph có thể lag sau khi sửa file. Nếu index báo stale, đọc file thật hoặc re-index trước khi kết luận.",
        "benefit": "Không tin mù vào index",
        "voiceoverScript": "Codegraph mạnh, nhưng vẫn là index. Khi source vừa đổi hoặc tool báo stale, agent phải đọc file thật hoặc re-index.",
        "durationSec": 8,
        "useInVideo": true,
        "sceneTemplateId": "grid-feature",
        "slots": {
          "header": {
            "type": "text",
            "text": "GUARDRAILS",
            "delay": 0,
            "animation": "fade-up",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Graph giúp hiểu nhanh, không thay thế kiểm chứng",
            "delay": 0.5,
            "animation": "fade-up",
            "enabled": true
          },
          "grid": {
            "type": "list",
            "items": [
              "Kiểm staleness sau khi edit file",
              "Ưu tiên source thật khi index chưa sync",
              "Không thay thế typecheck/test",
              "Dùng impact để review blast radius"
            ],
            "delay": 1.2,
            "animation": "pop",
            "enabled": true
          },
          "description": {
            "type": "text",
            "text": "Graph định hướng. Test xác nhận.",
            "delay": 4,
            "animation": "fade-up",
            "enabled": true
          }
        }
      },
      {
        "id": "scene_outro",
        "type": "outro",
        "name": "Agent hiểu code tốt hơn",
        "description": "Codegraph giúp agent chuyển từ đọc mò sang đọc có cấu trúc: đúng symbol, đúng flow, đúng impact.",
        "benefit": "Code intelligence layer",
        "voiceoverScript": "Tóm lại, Codegraph giúp agent đọc code có cấu trúc hơn: đúng symbol, đúng flow và đúng impact trước khi sửa.",
        "durationSec": 6,
        "useInVideo": true,
        "sceneTemplateId": "outro-cta",
        "slots": {
          "logo": {
            "type": "asset",
            "assetId": "asset_codegraph_logo",
            "delay": 0,
            "animation": "scale-in",
            "enabled": true
          },
          "title": {
            "type": "text",
            "text": "Hiểu code trước khi sửa",
            "delay": 0.4,
            "animation": "fade-up",
            "enabled": true
          },
          "cta": {
            "type": "text",
            "text": "Dùng Codegraph để hỏi codebase bằng cấu trúc, không bằng đoán mò.",
            "delay": 1.5,
            "animation": "pop",
            "enabled": true
          },
          "tag": {
            "type": "tag",
            "text": "Symbol · Flow · Impact",
            "delay": 2.5,
            "animation": "fade-up",
            "enabled": true
          }
        }
      }
    ],
    "milestones": [
      {
        "id": "ms_index",
        "name": "Index codebase",
        "date": "Bước 1",
        "description": "Parse source thành graph cục bộ.",
        "status": "completed"
      },
      {
        "id": "ms_explore",
        "name": "Explore context",
        "date": "Bước 2",
        "description": "Dùng graph để hiểu module hoặc flow chính.",
        "status": "completed"
      },
      {
        "id": "ms_impact",
        "name": "Check impact",
        "date": "Bước 3",
        "description": "Kiểm caller/callee và blast radius trước khi sửa.",
        "status": "active"
      },
      {
        "id": "ms_verify",
        "name": "Verify changes",
        "date": "Bước 4",
        "description": "Chạy test/typecheck/review sau khi sửa code.",
        "status": "upcoming"
      }
    ],
    "assets": [
      {
        "id": "asset_codegraph_logo",
        "name": "codegraph-logo-placeholder.png",
        "type": "logo",
        "size": "45 KB",
        "dateAdded": "2026-06-28",
        "url": "https://placehold.co/240x240/05070A/22D3EE?text=CG",
        "useInVideo": true
      },
      {
        "id": "asset_codegraph_map",
        "name": "codegraph-map-placeholder.png",
        "type": "screenshot",
        "size": "1.2 MB",
        "dateAdded": "2026-06-28",
        "url": "https://placehold.co/1080x720/101722/F8FAFC?text=File+%E2%86%92+Symbol+%E2%86%92+Call+Graph",
        "useInVideo": true
      }
    ],
    "videoStyleId": "dark-tech",
    "videoStyleOverrides": {},
    "defaultSceneTemplateId": "intro-stack",
    "sceneItemViews": [],
    "templateId": "dynamic-story-vertical",
    "templateConfig": {
      "theme": "dark",
      "accentColor": "blue",
      "fontSize": "default",
      "logoPosition": "top-left"
    },
    "voiceover": {
      "sceneScripts": {
        "intro": "Codegraph là bản đồ cấu trúc của codebase, giúp AI agent hiểu symbol, flow và impact trước khi sửa code.",
        "problem": "Trong codebase lớn, grep chỉ cho kết quả text. Nó không cho biết định nghĩa thật, call flow hay blast radius của thay đổi.",
        "solution": "Codegraph parse source thành graph gồm file, symbol và quan hệ. Vì vậy agent có thể hỏi thẳng vào cấu trúc code.",
        "features": "Agent dùng explore, search, node, callers, callees và impact để đi từ câu hỏi đến đúng vùng source cần đọc.",
        "timeline": "Workflow an toàn là đặt câu hỏi, explore context, inspect symbol, check impact, rồi mới sửa và verify.",
        "impact": "Kết quả là agent đọc ít file hơn, giữ context tốt hơn và giảm rủi ro sửa code dựa trên suy đoán.",
        "outro": "Codegraph giúp hiểu nhanh. Test, typecheck và review mới xác nhận thay đổi đúng."
      }
    },
    "audio": {
      "voiceover": {
        "enabled": true,
        "provider": "edge-tts",
        "language": "vi-VN",
        "voiceId": "vi-VN-HoaiMyNeural",
        "rate": "+4%",
        "volume": "+0%",
        "script": "Codegraph là bản đồ cấu trúc của codebase, giúp AI agent hiểu symbol, flow và impact trước khi sửa code. Khi codebase lớn, chỉ grep text là không đủ. Một tên hàm có thể xuất hiện ở nhiều nơi, flow có thể đi qua nhiều lớp, và agent dễ đọc thiếu context. Codegraph index source code thành knowledge graph cục bộ gồm file, symbol, định nghĩa, caller, callee và quan hệ phụ thuộc. Agent dùng explore để hiểu một khu vực, search và node để mở symbol chính xác, callers và callees để lần flow, impact để kiểm tra phạm vi ảnh hưởng. Workflow an toàn là đặt câu hỏi, explore context, inspect symbol, check impact, rồi mới sửa và verify bằng test, typecheck và review. Codegraph giúp hiểu nhanh hơn, nhưng không thay thế kiểm chứng."
      },
      "backgroundMusic": {
        "enabled": false,
        "source": "",
        "volume": 0.12,
        "ducking": true
      },
      "soundEffects": {
        "enabled": false,
        "items": []
      }
    },
    "video": {
      "formatId": "dynamic-story-vertical",
      "fps": 30,
      "outputFilename": "codegraph-ai-agent-intro.mp4"
    }
  };

  const isLegacySampleProject = (projectData = {}) => {
    const slug = String(projectData.projectSlug || projectData.slug || "").trim();
    return ["internal-analytics-dashboard", "codegraph-migration-agent"].includes(slug);
  };

  const normalizeProjectData = (projectData = {}) => {
    const normalizeVideoTemplate = (data = {}) => {
      const formats = Array.isArray(RENDER_FORMATS) ? RENDER_FORMATS : [];
      const selectedFormat = formats.find((format) => format.id === (data.video && data.video.formatId))
        || formats.find((format) => format.aspectRatio === (data.video && data.video.aspectRatio))
        || formats.find((format) => format.templateId === data.templateId)
        || null;
      if (!selectedFormat || data.templateId === selectedFormat.templateId) {
        return data;
      }
      return {
        ...data,
        templateId: selectedFormat.templateId
      };
    };
    const sourceProjectData = isLegacySampleProject(projectData) ? STATIC_SAMPLE_DATA : projectData;

    return normalizeVideoTemplate({
      ...JSON.parse(JSON.stringify(INITIAL_PROJECT_DATA)),
      ...sourceProjectData,
      templateConfig: {
        ...INITIAL_PROJECT_DATA.templateConfig,
        ...(sourceProjectData.templateConfig || {})
      },
      audio: {
        ...INITIAL_PROJECT_DATA.audio,
        ...(sourceProjectData.audio || {}),
        voiceover: {
          ...INITIAL_PROJECT_DATA.audio.voiceover,
          ...((sourceProjectData.audio && sourceProjectData.audio.voiceover) || {})
        }
      },
      voiceover: {
        ...INITIAL_PROJECT_DATA.voiceover,
        ...(sourceProjectData.voiceover || {}),
        sceneScripts: {
          ...INITIAL_PROJECT_DATA.voiceover.sceneScripts,
          ...((sourceProjectData.voiceover && sourceProjectData.voiceover.sceneScripts) || {})
        }
      },
      video: {
        ...INITIAL_PROJECT_DATA.video,
        ...(sourceProjectData.video || {})
      },
      features: Array.isArray(sourceProjectData.features) ? sourceProjectData.features : [],
      milestones: Array.isArray(sourceProjectData.milestones) ? sourceProjectData.milestones : [],
      assets: Array.isArray(sourceProjectData.assets) ? sourceProjectData.assets : []
    });
  };

  const loadLocalData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      const parsed = normalizeProjectData(JSON.parse(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error("Lỗi khi load local data:", e);
      return null;
    }
  };

  const loadProjectData = async () => {
    if (typeof AppBackendApi !== "undefined" && AppBackendApi.isBackendAvailable()) {
      try {
        const project = await AppBackendApi.loadCurrentProject();
        if (project) {
          let backendAssets = null;
          try {
            backendAssets = await AppBackendApi.loadAssets("current");
          } catch (_assetError) {}
          const normalized = normalizeProjectData({
            ...project,
            assets: Array.isArray(backendAssets) ? backendAssets : project.assets
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          } catch (_error) {}
          return normalized;
        }
      } catch (_error) {}
    }

    return loadLocalData();
  };

  const scheduleBackendProjectSave = (data) => {
    if (typeof AppBackendApi === "undefined" || !AppBackendApi.isBackendAvailable()) {
      return;
    }

    if (backendSaveTimer) {
      window.clearTimeout(backendSaveTimer);
    }

    const snapshot = JSON.parse(JSON.stringify(data));
    backendSaveTimer = window.setTimeout(async () => {
      try {
        await AppBackendApi.saveCurrentProject(snapshot);
        window.dispatchEvent(new CustomEvent("backendProjectSaved"));
      } catch (error) {
        window.dispatchEvent(new CustomEvent("backendProjectSaveFailed", {
          detail: { message: error.message }
        }));
      }
    }, BACKEND_SAVE_DEBOUNCE_MS);
  };

  const saveLocalData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      AppState.setDirty(false);
      scheduleBackendProjectSave(data);
      return true;
    } catch (e) {
      console.error("Lỗi khi lưu local data:", e);
      scheduleBackendProjectSave(data);
      return false;
    }
  };

  const normalizeSettings = (settings = {}) => ({
    ...DEFAULT_SETTINGS,
    ...settings,
    validation: {
      ...DEFAULT_SETTINGS.validation,
      ...(settings.validation || {})
    }
  });

  const loadLocalSettings = () => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return normalizeSettings(parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  };

  const loadSettingsData = async () => {
    if (typeof AppBackendApi !== "undefined" && AppBackendApi.isBackendAvailable()) {
      try {
        const settings = await AppBackendApi.loadSettings();
        if (settings) {
          settingsCache = normalizeSettings(settings);
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsCache));
          } catch (_error) {}
          return settingsCache;
        }
      } catch (_error) {}
    }

    settingsCache = loadLocalSettings();
    return settingsCache;
  };

  const loadSettings = () => settingsCache;

  const saveSettings = (settings) => {
    const normalizedSettings = normalizeSettings(settings);
    settingsCache = normalizedSettings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizedSettings));
    } catch (e) {
      window.dispatchEvent(new CustomEvent("backendSettingsSaveFailed", {
        detail: { message: e.message }
      }));
      return false;
    }

    if (typeof AppBackendApi !== "undefined" && AppBackendApi.isBackendAvailable()) {
      return AppBackendApi.saveSettings(normalizedSettings)
        .then((savedSettings) => {
          settingsCache = normalizeSettings(savedSettings || normalizedSettings);
          window.dispatchEvent(new CustomEvent("backendSettingsSaved", {
            detail: { settings: settingsCache }
          }));
          return true;
        })
        .catch((error) => {
          window.dispatchEvent(new CustomEvent("backendSettingsSaveFailed", {
            detail: { message: error.message }
          }));
          return false;
        });
    }

    return true;
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
    loadProjectData,
    loadLocalData,
    saveLocalData,
    loadSettingsData,
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
