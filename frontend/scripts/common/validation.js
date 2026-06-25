/* Real-time Project Data Validation */

const AppValidation = (() => {
  const validate = (data) => {
    const errors = [];
    const warnings = [];

    // --- ERROR CHECKS (Must fix to render) ---

    // 1. Video topic
    if (!data.projectName || data.projectName.trim() === "") {
      errors.push({
        id: "err_project_name",
        tab: "content",
        field: "projectName",
        title: "Thiếu chủ đề video",
        message: "Chủ đề video là bắt buộc để hiển thị trong phần mở đầu và tiêu đề output."
      });
    }

    // 2. Video slug
    if (!data.projectSlug || data.projectSlug.trim() === "") {
      errors.push({
        id: "err_project_slug",
        tab: "content",
        field: "projectSlug",
        title: "Thiếu mã video",
        message: "Mã video dùng để đặt tên file output khi render."
      });
    }

    // 3. Short Summary
    if (!data.shortSummary || data.shortSummary.trim() === "") {
      errors.push({
        id: "err_short_summary",
        tab: "content",
        field: "shortSummary",
        title: "Thiếu mô tả ngắn",
        message: "Mô tả ngắn dùng làm phần giới thiệu nhanh cho video."
      });
    }

    // 4. Template Selection
    if (!data.templateId) {
      errors.push({
        id: "err_template",
        tab: "template",
        field: "templateId",
        title: "Chưa chọn template video",
        message: "Bạn phải chọn một template video mẫu trong danh sách để render."
      });
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

    // 3. Script segment count
    const activeFeatures = (data.features || []).filter(f => f.useInVideo);
    if (activeFeatures.length < 1) {
      warnings.push({
        id: "war_features_count_low",
        tab: "features",
        field: "features-list",
        title: "Chưa có đoạn kịch bản đang bật",
        message: "Video cần ít nhất 1 đoạn kịch bản đang bật để nội dung không bị trống."
      });
    } else if (activeFeatures.length > 6) {
      warnings.push({
        id: "war_features_count_high",
        tab: "features",
        field: "features-list",
        title: "Quá nhiều đoạn kịch bản",
        message: `Hiện có ${activeFeatures.length} đoạn đang bật. Video ngắn dễ bị kéo dài hoặc lướt quá nhanh.`
      });
    }

    // 4. Missing visual asset
    const activeVisual = (data.assets || []).some(a => ["logo", "screenshot", "image", "background", "video"].includes(a.type) && a.useInVideo);
    if (!activeVisual) {
      warnings.push({
        id: "war_asset_missing",
        tab: "assets",
        field: "upload-zone",
        title: "Chưa chọn asset hình ảnh",
        message: "Video vẫn render được, nhưng nên chọn ít nhất một logo, screenshot hoặc video demo để preview bớt trống."
      });
    }

    return { errors, warnings };
  };

  return {
    validate
  };
})();
