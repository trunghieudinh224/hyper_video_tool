# Nghiên cứu công cụ video trên GitHub

Cập nhật: 2026-11-17. Đây là đánh giá repo và tài liệu chính thức. Mediabunny và wavesurfer.js đã được vendor trong HVT; FFmpeg sẵn có đã được dùng thêm cho ghép TTS đa ngôn ngữ và burn phụ đề. Các repo khác trong bảng chưa được cài qua nghiên cứu này. Kiểm lại version, license và khả năng chạy trên máy đích trước mỗi lần nâng cấp.

## Đã tích hợp trong HVT

- HyperFrames 0.7.1, `ffmpeg-static` 5.3.0 và `ffprobe-static` 3.1.0 đã có trong runner trước nghiên cứu này.
- Mediabunny 1.66.0 và wavesurfer.js 8.1.0 được vendor cùng license tại `frontend/vendor/media/`. Trang Tài nguyên dùng chúng để đọc metadata video/audio và hiển thị waveform audio tối đa 5 MB. Player HTML5 mở video/audio; backend trả byte range để có thể seek.
- Test backend asset/routing và kiểm gói Mediabunny với media mẫu đã qua. Browser smoke cho asset inspector chưa chạy; browser smoke trang Kịch bản/Preview/Outputs và modal subtitle đã chạy trong task subtitle/TTS tiếp theo.

## Điểm xuất phát của HVT

- HVT là công cụ **tạo video từ brief/kịch bản/scene/template**, chạy local: frontend HTML/CSS/JS nhiều trang, backend Node.js, HyperFrames render MP4. Runner đang khóa `hyperframes@0.7.1` trong `backend/hyperframes-runner-package.json`. Đây chưa phải trình biên tập nhiều track kiểu NLE.
- Backend đã có `ffmpeg-static`/`ffprobe-static` trong runner, dùng FFmpeg để mux voiceover/nhạc, ghép đoạn TTS đa ngôn ngữ, burn phụ đề và đo thời lượng (`backend/src/render/media.js`). Asset upload đã nhận MP4/MOV/WebM và audio. Edge TTS 7.3.1 tạo SRT, nhưng word timing có thể phải ước lượng; HVT đã nối SRT vào preview, output sidecar và render.
- Vì vậy nên cải thiện **media ingestion, preview, audio timing và render reliability** trên pipeline hiện có trước khi chọn render engine hoặc UI editor mới. Repo tham khảo không đồng nghĩa với dependency cần cài ngay.

## Ưu tiên nghiên cứu và tích hợp

| Ưu tiên | Repo | Dùng cho HVT | Giới hạn / quyết định |
| --- | --- | --- | --- |
| P0, củng cố renderer | [HyperFrames](https://github.com/heygen-com/hyperframes) | Tiếp tục dùng HTML/CSS, animation seekable và CLI render MP4. Repo chính thức có skill về plan, lint, preview, render và media QA; Apache-2.0. | Đối chiếu skill/tài liệu theo đúng bản CLI HVT đang khóa trước khi đưa vào `.agents`; không chạy installer tự động vì có thể ghi đè skill local hoặc lấy hướng dẫn không khớp version. |
| P0, tận dụng sẵn | [FFmpeg](https://github.com/FFmpeg/FFmpeg) | Probe codec/duration/rotation, thumbnail, trim/normalize clip, audio mix, subtitle mux/burn ở backend. | Đã có binary qua runner; thêm thao tác nhỏ trong `backend/src/render/media.js` khi có feature cụ thể. License binary phụ thuộc cấu hình build: phần lõi LGPL, tùy chọn GPL. [Nguồn license](https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md). |
| P1, khi làm audio timing UI | [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | Hiển thị waveform voiceover/nhạc, đánh dấu vùng và mốc thời gian trong preview. Có bản UMD dùng được với frontend không build step. BSD-3-Clause. | Chỉ là player/waveform, không xử lý audio; file dài có thể tốn RAM, cần precomputed peaks. Không nhầm với trang `timeline.html` cũ của HVT. |
| P1, khi làm metadata/thumbnail ở browser | [Mediabunny](https://github.com/Vanilagy/mediabunny) | Đọc metadata, lấy frame/track, kiểm codec và thử preview media client-side. MPL-2.0. | Dựa vào WebCodecs; browser có thể không decode được codec dù thư viện nhận ra container. Backend FFprobe vẫn là nguồn xác nhận cho render. Không cần chuyển xuất MP4 sang browser. [Nguồn API](https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/reading-media-files.md). |
| P2, nếu cần biên tập clip trong browser | [WebAV](https://github.com/WebAV-Tech/WebAV) | Clip video/audio/image/text, layer vị trí/thời gian, SRT embed, compositing MP4 trên browser. MIT. | Repo ghi Chrome 102+ và Edge/Electron; cần thử codec, memory, file lớn và độ khớp với HyperFrames. Chỉ dùng cho workflow edit clip rõ ràng, không thay renderer hiện tại. [Nguồn package](https://github.com/WebAV-Tech/WebAV/blob/main/packages/av-cliper/README.md). |
| P2, nếu người dùng nhập video quay sẵn | [PySceneDetect](https://github.com/Breakthrough/PySceneDetect) | Tìm shot/cut để gợi ý chia clip, lấy still hoặc tổ chức asset. BSD-3-Clause. | Python/OpenCV hoặc PyAV là runtime mới; chỉ đáng thêm khi HVT có flow import video dài. [Nguồn thuật toán](https://github.com/Breakthrough/PySceneDetect/blob/main/website/pages/api.md). |
| P2, nếu người dùng nhập giọng đọc/clip có lời | [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | ASR local để tạo transcript/subtitle cho audio có sẵn; repo MIT. | Cần tải model và benchmark CPU/GPU, ngôn ngữ và độ chính xác. Voiceover do Edge TTS sinh đã có SRT, nên không dùng ASR cho luồng TTS đó. |
| P3, khi có flow xóa đoạn lặng | [auto-editor](https://github.com/WyattBlue/auto-editor) | Tự cắt khoảng lặng hoặc đoạn ít chuyển động trên footage nhập vào; Unlicense cho source repo. | Ứng dụng CLI riêng, hiện viết bằng Nim; không giải quyết video tạo từ scene/template. Binary release có thể mang license khác source. |
| P3, khi cần giao video cho NLE | [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) | Định dạng trao đổi thứ tự/thời lượng cut và link media với editor khác; Apache-2.0. | Không chứa media và không render; không cần cho project JSON/render contract hiện tại. |

## Repo lớn cần tham khảo có chọn lọc

| Repo | Bài học có thể lấy | Vì sao chưa chọn làm nền HVT |
| --- | --- | --- |
| [Remotion](https://github.com/remotion-dev/remotion) | Composition và render bằng React/Node, player, caption và animation. | Chuyển template/preview sang React là thay kiến trúc lớn; [license riêng](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) yêu cầu Company License với tổ chức vì lợi nhuận trên 3 nhân viên. Chỉ POC nếu HyperFrames không đáp ứng yêu cầu cụ thể. |
| [OpenVideo Editor](https://github.com/openvideodev/react-video-editor) | Tham khảo UX canvas, multi-track timeline và local export. | Starter Next.js 15/PixiJS/Zustand/Tailwind, khác hẳn UI tĩnh; [repo ghi dual license](https://github.com/openvideodev/react-video-editor#license--commercial-usage) với Company License cho tổ chức trên 3 nhân viên. Không copy nguyên app/editor. |
| [MLT](https://github.com/mltframework/mlt) và [libopenshot](https://github.com/OpenShot/libopenshot) | Kiến trúc NLE nhiều track, effect, audio mix. | Runtime C/C++ lớn, binding/integration và đóng gói local phức tạp; HVT đang làm scripted template video. MLT ghi LGPL; libopenshot LGPL-3.0. |
| [LosslessCut](https://github.com/mifi/lossless-cut) | Tham khảo UX trim/remux/stream copy và công cụ FFmpeg. | Là app desktop hoàn chỉnh; [FAQ](https://github.com/mifi/lossless-cut/blob/master/docs/faq.md) nói rõ không hỗ trợ overlay text, burn subtitle hay transition, là các nhu cầu của HVT. |
| [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) | FFmpeg chạy trong browser nếu sau này cần xử lý hoàn toàn phía client. | HVT đã có FFmpeg native qua backend local; thêm WASM sẽ tăng runtime/tải browser và tạo pipeline xử lý thứ hai mà chưa có nhu cầu. |

## Đề xuất thứ tự làm sản phẩm

1. **Củng cố đầu vào media bằng FFmpeg sẵn có.** Khi thêm tính năng clip, ghi metadata qua FFprobe sau upload; báo codec/duration/rotation; tạo thumbnail; normalize/trim chỉ khi render template cần. Giữ `assetId` và project JSON là contract, không đưa path máy local vào payload.
2. **Làm preview/audio timing có mục tiêu.** Với voiceover/nhạc, thử waveform bằng wavesurfer.js trên một trang liên quan; nếu audio dài thì tính peaks ở backend. Với clip video, thử Mediabunny cho metadata/frame preview, so kết quả với FFprobe và browser hỗ trợ.
3. **Chỉ mở rộng sang clip editor khi có yêu cầu UX rõ.** WebAV là ứng viên browser-first cho clip trim/layer; POC một clip + một image + một audio, export MP4, kiểm frame và A/V sync. Nếu cần render độc lập với browser, vẫn đi qua HyperFrames/FFmpeg.
4. **ASR/scene detection là nhánh nhập footage.** Whisper.cpp và PySceneDetect chỉ hợp khi người dùng tải video/audio có sẵn để tái biên tập. Không thêm vào luồng tạo video từ brief mặc định.
5. **Chưa thay HyperFrames.** Trước một quyết định thay engine, cần một mẫu HVT thực tế chứng minh renderer hiện tại không đáp ứng về chất lượng, thời gian, ổn định hoặc khả năng biên tập; so cùng payload, audio, subtitle và output trên engine ứng viên.

## Điều kiện qua POC

- Bảo toàn project data, asset ID, aspect ratio 16:9/9:16 và render payload hiện có.
- Kiểm video có hình ở nhiều mốc, đúng duration/resolution, audio sync, subtitle và file size; job `succeeded` một mình chưa đủ.
- Chạy trên máy local đích, không cần cloud/API key; đo thời gian và RAM với clip ngắn lẫn clip dài.
- Xác nhận license của **bản package/binary cụ thể** trước khi phân phối, đặc biệt FFmpeg, Remotion và các repo dual-license.
