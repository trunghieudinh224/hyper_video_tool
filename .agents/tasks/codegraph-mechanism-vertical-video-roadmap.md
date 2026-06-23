# Roadmap: Video Dọc CodeGraph Mechanism

Ngày tạo: 23/06/2026

## Objective

Tạo một video dọc `9:16` bằng tiếng Việt giải thích nội dung file
`/Users/dinhtrunghieu/Freelance/migration_agent/.agents/knowledge/codegraph-mechanism.md`.

Video cần dễ hiểu cho người đang onboard vào Migration Agent: CodeGraph là gì, vì sao cần trong migration G/S,
cách Agent dùng tool, cách tránh đọc nhầm path, và các giới hạn cần nhớ.

## Source

- Main source: `migration_agent/.agents/knowledge/codegraph-mechanism.md`
- Supporting context: `migration_agent/.agents/context/project-context.md`
- Supporting context: `migration_agent/.agents/knowledge/codegraph-installation.md`

## In Scope

- Video frame dọc `9:16`, template `project-showcase-vertical-60s`.
- Nội dung tiếng Việt.
- Text ngắn, dễ scan, phù hợp giới hạn của template dọc.
- Voiceover tiếng Việt bằng `edge-tts`.
- Tạo project data riêng trong `data/`.
- Tạo render payload riêng trong `data/`.
- Render MP4 thật nếu HyperFrames/preflight local chạy được.

## Out Of Scope

- Không sửa template HyperFrames trong phase này.
- Không thêm background music hoặc sound effects.
- Không thay đổi sample project mặc định.
- Không chạy CodeGraph thật trong `migration_agent`.

## Storyline

1. **Intro**: CodeGraph là bản đồ symbol/call graph cục bộ cho Migration Agent.
2. **Problem**: Migrate Java NetBeans phải đọc nhiều bản G/S, class trùng tên dễ đọc nhầm.
3. **Solution**: CodeGraph parse source bằng tree-sitter, tạo node/edge, lưu SQLite và expose qua MCP.
4. **Core blocks**:
   - Parse source thành graph.
   - Phân biệt G/S bằng path `MgsV3` và `MgsV4`.
   - Dùng `explore/search/node/callers/callees/impact`.
   - Sync/staleness và luôn build/test sau khi sửa.
5. **Flow**: Symlink workspace → index graph → query đúng path → adapt logic vào S.
6. **Impact**: Agent đọc đúng ngữ cảnh, giảm grep thủ công, giảm rủi ro copy nhầm G sang S.
7. **Outro**: CodeGraph giúp hiểu nhanh, nhưng quyết định migrate vẫn phải theo style/API của S.

## Files Impact

- NEW `.agents/tasks/codegraph-mechanism-vertical-video-roadmap.md`
- NEW `data/codegraph-mechanism-project.json`
- NEW `data/codegraph-mechanism-render-payload.json`
- Generated MP4 in `outputs/` if render succeeds.

## Verification Plan

- Validate project JSON can map to render payload.
- Validate render payload schema.
- Run backend checks if needed.
- Render via backend smoke API with expected resolution `1080x1920`.
- Verify output manifest contains rendered MP4.

## Test Report

Status: passed

- Commands run:
  - `node --check backend/src/render/project-to-render-payload.js`
  - `node -e "... projectToRenderPayload(...) ... validateRenderPayload(...)"` for `data/codegraph-mechanism-project.json`
  - `npm --prefix backend run check`
  - `PATH="/Users/dinhtrunghieu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-vertical-60s doctor`
  - `HVT_SMOKE_BASE_URL=http://127.0.0.1:3041 HVT_SMOKE_PAYLOAD_PATH=data/codegraph-mechanism-render-payload.json HVT_SMOKE_EXPECT_RESOLUTION=1080x1920 HVT_SMOKE_TIMEOUT_MS=240000 npm --prefix backend run smoke:render-api`
  - `.cache/edge-tts-venv/bin/python -m edge_tts --version`
  - `node -e "... generateVoiceover(payload) ..."`
  - `.cache/hyperframes-runner/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of default=noprint_wrappers=1 outputs/361a5d6f-353b-4534-96c1-2998302f2d29.mp4`
  - `.cache/hyperframes-runner/bin/ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate -of default=noprint_wrappers=1 outputs/361a5d6f-353b-4534-96c1-2998302f2d29.mp4`
- Render output:
  - `outputs/361a5d6f-353b-4534-96c1-2998302f2d29.mp4`
  - Resolution: `1080x1920`
  - Duration: `64.000000s`
  - Size: `3.2M`
  - Audio stream: `aac`, `24000Hz`, `1` channel.
  - Voiceover cache: `outputs/audio/709a8613993faf8e.mp3`
  - Subtitle sidecar: `outputs/audio/709a8613993faf8e.srt`
  - Manifest contains job `361a5d6f-353b-4534-96c1-2998302f2d29`, template `project-showcase-vertical-60s`, project name `CodeGraph trong Migration Agent`.
  - Frame QA extracted:
    - `/private/tmp/hvt-codegraph-frames/intro.png`
    - `/private/tmp/hvt-codegraph-frames/features.png`
    - `/private/tmp/hvt-codegraph-frames/impact.png`
- Remaining risks:
  - Background music and sound effects are not included in this phase.
  - MP4 duration follows mux `-shortest`, so final video duration follows the generated voiceover length.
  - `backend/scripts/check-hyperframes.js` flags PATH `ffmpeg` missing on the system shell, but HyperFrames local runner resolves its own ffmpeg at `.cache/hyperframes-runner/bin/ffmpeg` and render succeeded.
