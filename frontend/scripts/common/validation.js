/* Real-time Project Data Validation */

const AppValidation = (() => {
  const validate = (data) => {
    const errors = [];
    const warnings = [];

    // --- ERROR CHECKS (Must fix to render) ---

    // 1. Project Name
    if (!data.projectName || data.projectName.trim() === "") {
      errors.push({
        id: "err_project_name",
        tab: "content",
        field: "projectName",
        title: "Thiếu tên dự án",
        message: "Tên dự án là bắt buộc để hiển thị trong slide mở đầu và tiêu đề video."
      });
    }

    // 2. Project Slug
    if (!data.projectSlug || data.projectSlug.trim() === "") {
      errors.push({
        id: "err_project_slug",
        tab: "content",
        field: "projectSlug",
        title: "Thiếu đường dẫn dự án (slug)",
        message: "Đường dẫn slug dùng để đặt tên file video output khi xuất bản."
      });
    }

    // 3. Short Summary
    if (!data.shortSummary || data.shortSummary.trim() === "") {
      errors.push({
        id: "err_short_summary",
        tab: "content",
        field: "shortSummary",
        title: "Thiếu mô tả ngắn",
        message: "Mô tả ngắn dùng làm nội dung giới thiệu nhanh bối cảnh dự án."
      });
    }

    // 4. Problem
    if (!data.problemContext || data.problemContext.trim() === "") {
      errors.push({
        id: "err_problem",
        tab: "content",
        field: "problemContext",
        title: "Thiếu vấn đề cần giải quyết",
        message: "Slide vấn đề yêu cầu mô tả nỗi đau thực tế để làm nổi bật giải pháp."
      });
    }

    // 5. Solution
    if (!data.solutionWhat || data.solutionWhat.trim() === "") {
      errors.push({
        id: "err_solution",
        tab: "content",
        field: "solutionWhat",
        title: "Thiếu giải pháp đã xây dựng",
        message: "Giải pháp mô tả cách sản phẩm hoạt động để giải quyết vấn đề."
      });
    }

    // 6. Template Selection
    if (!data.templateId) {
      errors.push({
        id: "err_template",
        tab: "template",
        field: "templateId",
        title: "Chưa chọn template video",
        message: "Bạn phải chọn một template video mẫu trong danh sách để render."
      });
    }

    // 7. Assets for Showcase template
    if (data.templateId === "project-showcase-90s") {
      const activeScreenshots = (data.assets || []).filter(
        a => a.type === "screenshot" && a.useInVideo
      );
      if (activeScreenshots.length === 0) {
        errors.push({
          id: "err_screenshots_empty",
          tab: "assets",
          field: "upload-zone",
          title: "Thiếu ảnh chụp màn hình",
          message: "Template 90s yêu cầu ít nhất 1 ảnh chụp màn hình (screenshot) được chọn để đưa vào video."
        });
      }
    }


    // --- WARNING CHECKS (Can render but should improve) ---

    // 1. Tagline too long
    if (data.tagline && data.tagline.length > 80) {
      warnings.push({
        id: "war_tagline_length",
        tab: "content",
        field: "tagline",
        title: "Tagline quá dài",
        message: `Tagline hiện tại (${data.tagline.length} ký tự) dài hơn khuyến nghị (80 ký tự). Có thể bị tràn slide.`
      });
    }

    // 2. Short summary too long
    if (data.shortSummary && data.shortSummary.length > 200) {
      warnings.push({
        id: "war_summary_length",
        tab: "content",
        field: "shortSummary",
        title: "Mô tả ngắn hơi dài",
        message: `Mô tả ngắn (${data.shortSummary.length} ký tự) dài hơn khuyến nghị (200 ký tự). Hãy tóm gọn hơn.`
      });
    }

    // 3. Problem too long
    if (data.problemContext && data.problemContext.length > 300) {
      warnings.push({
        id: "war_problem_length",
        tab: "content",
        field: "problemContext",
        title: "Mô tả vấn đề quá dài",
        message: "Mô tả vấn đề nên dưới 300 ký tự để người xem scan dễ dàng hơn."
      });
    }

    // 4. Solution too long
    if (data.solutionWhat && data.solutionWhat.length > 300) {
      warnings.push({
        id: "war_solution_length",
        tab: "content",
        field: "solutionWhat",
        title: "Mô tả giải pháp quá dài",
        message: "Mô tả giải pháp nên dưới 300 ký tự để dễ bố cục chữ trên slide."
      });
    }

    // 5. Features count
    const activeFeatures = (data.features || []).filter(f => f.useInVideo);
    if (activeFeatures.length < 3) {
      warnings.push({
        id: "war_features_count_low",
        tab: "features",
        field: "features-list",
        title: "Quá ít tính năng đưa vào video",
        message: `Hiện chỉ có ${activeFeatures.length} tính năng được chọn dùng. Khuyến nghị đưa 3-6 tính năng.`
      });
    } else if (activeFeatures.length > 6) {
      warnings.push({
        id: "war_features_count_high",
        tab: "features",
        field: "features-list",
        title: "Quá nhiều tính năng đưa vào video",
        message: `Hiện có ${activeFeatures.length} tính năng được chọn dùng. Video 90s dễ bị kéo dài hoặc lướt quá nhanh.`
      });
    }

    // 6. Timeline count
    if (!data.milestones || data.milestones.length === 0) {
      warnings.push({
        id: "war_timeline_empty",
        tab: "timeline",
        field: "timeline-list",
        title: "Timeline trống",
        message: "Chưa có cột mốc phát triển nào. Video sẽ bỏ qua slide timeline phát triển dự án."
      });
    }

    // 7. Missing result impact
    if (!data.resultImpact || data.resultImpact.trim() === "") {
      warnings.push({
        id: "war_result_impact",
        tab: "content",
        field: "resultImpact",
        title: "Thiếu kết quả đạt được",
        message: "Nên bổ sung kết quả hoặc tác động thực tế để tăng tính thuyết phục cho video thuyết trình."
      });
    }

    // 8. Missing Logo Asset
    const activeLogo = (data.assets || []).some(a => a.type === "logo" && a.useInVideo);
    if (!activeLogo) {
      warnings.push({
        id: "war_logo_missing",
        tab: "assets",
        field: "upload-zone",
        title: "Chưa chọn logo dự án",
        message: "Không có logo nào được tích hợp vào video. Logo của Platform Team sẽ được dùng làm mặc định."
      });
    }

    return { errors, warnings };
  };

  return {
    validate
  };
})();
