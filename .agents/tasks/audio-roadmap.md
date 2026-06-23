# Audio Roadmap

Roadmap này chia phần âm thanh thành các phase nhỏ để mỗi phase có thể review, test và commit riêng.

## Phase 1 - Voiceover Contract + Local TTS Groundwork

Status: done

Scope:
- Thêm `audio.voiceover`, `audio.backgroundMusic`, `audio.soundEffects` vào render payload contract.
- Hỗ trợ voiceover MVP cho 3 ngôn ngữ: `vi-VN`, `en-US`, `ja-JP`.
- Chọn `edge-tts` làm local MVP provider vì không cần API key, phù hợp prototype local.
- Thêm helper backend để build narration script, chuẩn hóa voice config, tạo cache key/path và args gọi `edge-tts`.
- Thêm test Node/assert chạy trong `npm --prefix backend run check`.

Out of scope:
- Chưa tự động mux voice vào MP4.
- Chưa thêm UI nhập script/chọn voice.
- Chưa thêm OpenAI, ElevenLabs hoặc Piper provider thật.

Test report:
- `npm --prefix backend run check` - passed

## Phase 2 - Render MP4 With Voiceover

Status: done

Scope:
- Khi `audio.voiceover.enabled=true`, backend generate voice MP3 trước khi render.
- Gắn voice MP3 vào output MP4 sau render bằng FFmpeg.
- Lưu metadata voiceover vào job/output manifest.
- Verify output MP4 có audio stream bằng FFprobe.
- Thêm retry cho `edge-tts` vì service đôi khi trả audio rỗng transient.

Risks:
- `edge-tts` cần Python package và network; phải fail rõ nếu chưa cài.
- FFmpeg/FFprobe ưu tiên dùng runner cache thay vì yêu cầu global binary.

Test report:
- `npm --prefix backend run audio:setup` - passed
- `HVT_SMOKE_BASE_URL=http://127.0.0.1:3026 HVT_SMOKE_PAYLOAD_PATH=/private/tmp/hvt-voiceover-payload.json HVT_SMOKE_TIMEOUT_MS=180000 npm --prefix backend run smoke:render-api` - passed
- FFprobe output audio stream: `aac`

## Phase 3 - Voiceover UI

Status: done

Scope:
- Thêm section voiceover trên màn Render.
- Cho chọn language/voice, nhập script, bật/tắt voiceover.
- Lưu state vào payload render.

Out of scope:
- Chưa làm nút preview voice riêng.

Test report:
- Playwright smoke bằng Chrome hệ thống: desktop 1440px và mobile 390px không overflow, payload voiceover cập nhật đúng.

## Phase 4 - Background Music

Status: pending

Scope:
- Cho chọn file nhạc nền hoặc preset local.
- Mix music dưới voiceover, có volume và ducking.
- Verify output vẫn nghe voice rõ.

## Phase 5 - Animation Sound Effects

Status: pending

Scope:
- Thêm optional SFX theo scene/event.
- Giữ default off để không làm video ồn.
- Chỉ bật khi template có event rõ.

## Future Provider Options

- OpenAI TTS: provider chính thức, trả phí, phù hợp khi cần chất lượng ổn định.
- ElevenLabs: chất lượng cao, trả phí, phù hợp giọng thương mại.
- Piper: offline/free thật, cần spike chất lượng tiếng Việt/Nhật trước khi dùng.
