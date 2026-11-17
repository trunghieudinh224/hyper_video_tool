"use strict";

const { parseSync, stringifySync } = require("subtitle");
const { buildTimelinePlan } = require("../../../templates/shared/motion-core/duration");

const MAX_SUBTITLE_CHARS = 500000;

function parseSrtCues(value) {
  const source = String(value || "");
  if (source.length > MAX_SUBTITLE_CHARS) {
    throw new Error("Subtitle text is too long.");
  }
  return parseSync(source)
    .filter((node) => node.type === "cue")
    .map((node) => ({
      start: Number(node.data.start),
      end: Number(node.data.end),
      text: String(node.data.text || "").trim()
    }))
    .filter((cue) => Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start && cue.text)
    .sort((left, right) => left.start - right.start);
}

function normalizeCaptionSettings(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const layout = source.layout && typeof source.layout === "object" ? source.layout : {};
  const width = Math.max(20, Math.min(92, Number(layout.width) || 90));
  const height = Math.max(6, Math.min(34, Number(layout.height) || 14));
  const x = Number.isFinite(Number(layout.x)) ? Number(layout.x) : 5;
  const y = Number.isFinite(Number(layout.y)) ? Number(layout.y) : 74;
  return {
    enabled: source.enabled === true,
    mode: ["voice", "custom", "srt"].includes(source.mode) ? source.mode : "voice",
    style: ["bottom-caption", "karaoke", "minimal"].includes(source.style) ? source.style : "bottom-caption",
    text: String(source.text || "").trim(),
    fontSize: Math.max(8, Math.min(48, Number(source.fontSize) || 16)),
    fontWeight: Math.max(300, Math.min(900, Number(source.fontWeight) || 500)),
    maxLines: Math.max(1, Math.min(6, Number(source.maxLines) || 3)),
    layout: {
      x: Math.max(0, Math.min(100 - width, x)),
      y: Math.max(0, Math.min(100 - height, y)),
      width,
      height
    }
  };
}

function groupVoiceCues(cues, options = {}) {
  const maxChars = Math.max(12, Number(options.maxChars) || 48);
  const maxDuration = Math.max(800, Number(options.maxDuration) || 3200);
  const segmenter = new Intl.Segmenter(options.language || "vi-VN", { granularity: "word" });
  const timedWords = cues.flatMap((cue) => {
    const tokens = Array.from(segmenter.segment(cue.text), ({ segment }) => segment.trim())
      .filter(Boolean)
      .reduce((items, token) => {
        if (/^[,.!?;:…]+$/.test(token) && items.length) {
          items[items.length - 1] += token;
        } else {
          items.push(token);
        }
        return items;
      }, []);
    if (tokens.length < 2) return [cue];
    const totalWeight = tokens.reduce((total, token) => total + Array.from(token).length, 0);
    let weight = 0;
    return tokens.map((token, index) => {
      const start = Math.round(cue.start + (cue.end - cue.start) * weight / totalWeight);
      weight += Array.from(token).length;
      const end = index === tokens.length - 1
        ? cue.end
        : Math.round(cue.start + (cue.end - cue.start) * weight / totalWeight);
      return { start, end, text: token };
    }).filter((word) => word.end > word.start);
  });
  const groups = [];
  let pending = [];
  const flush = () => {
    if (!pending.length) return;
    groups.push({
      start: pending[0].start,
      end: pending[pending.length - 1].end,
      text: pending.map((cue) => cue.text).join(" ").replace(/\s+([,.!?;:])/g, "$1"),
      words: pending
    });
    pending = [];
  };

  for (const cue of timedWords) {
    const nextLength = [...pending, cue].map((item) => item.text).join(" ").length;
    const gap = pending.length ? cue.start - pending[pending.length - 1].end : 0;
    if (pending.length && (nextLength > maxChars || cue.end - pending[0].start > maxDuration || gap > 500)) {
      flush();
    }
    pending.push(cue);
    if (/[.!?]$/.test(cue.text)) flush();
  }
  flush();
  return groups;
}

function buildCaptionTimeline(payload, voiceSrt = "") {
  const resolvedScenes = buildTimelinePlan(payload).scenes;
  let cursor = 0;
  const scenePlan = resolvedScenes.map((scene, index) => {
    const configuredDuration = payload.scenes[index] && payload.scenes[index].duration;
    const duration = Number.isFinite(configuredDuration) ? configuredDuration : scene.duration;
    const result = { ...scene, start: cursor, end: cursor + duration };
    cursor = result.end;
    return result;
  });
  const rawVoiceCues = Array.isArray(voiceSrt) ? voiceSrt : parseSrtCues(voiceSrt);
  const captions = [];
  for (const sceneTime of scenePlan) {
    const scene = payload.scenes[sceneTime.index];
    const settings = normalizeCaptionSettings(scene && scene.captions);
    if (!settings.enabled) continue;
    const sceneStart = Math.round(sceneTime.start * 1000);
    const sceneEnd = Math.round(sceneTime.end * 1000);
    let sceneCues = [];
    if (settings.mode === "voice") {
      const words = rawVoiceCues
        .filter((cue) => cue.end > sceneStart && cue.start < sceneEnd)
        .map((cue) => ({ ...cue, start: Math.max(sceneStart, cue.start), end: Math.min(sceneEnd, cue.end) }))
        .filter((cue) => cue.end > cue.start);
      const charsPerLine = payload.video.aspectRatio === "9:16" ? 22 : 42;
      sceneCues = groupVoiceCues(words, {
        maxChars: Math.round(charsPerLine * settings.maxLines * settings.layout.width / 90),
        language: payload.audio && payload.audio.voiceover && payload.audio.voiceover.language
      });
    } else if (settings.mode === "custom" && settings.text) {
      sceneCues = [{ start: sceneStart, end: sceneEnd, text: settings.text }];
    } else if (settings.mode === "srt" && settings.text) {
      sceneCues = parseSrtCues(settings.text)
        .map((cue) => ({ ...cue, start: cue.start + sceneStart, end: cue.end + sceneStart }))
        .filter((cue) => cue.end > sceneStart && cue.start < sceneEnd)
        .map((cue) => ({ ...cue, start: Math.max(sceneStart, cue.start), end: Math.min(sceneEnd, cue.end) }));
    }
    sceneCues.forEach((cue) => captions.push({
      ...cue,
      sceneId: sceneTime.id,
      settings
    }));
  }
  return captions.sort((left, right) => left.start - right.start);
}

function approximateVoiceCues(script, durationMs) {
  const text = String(script || "").replace(/\s+/g, " ").trim();
  const end = Math.round(Number(durationMs));
  return text && Number.isFinite(end) && end > 0 ? [{ start: 0, end, text }] : [];
}

function toSrt(cues) {
  return stringifySync(cues.map((cue) => ({
    type: "cue",
    data: { start: cue.start, end: cue.end, text: cue.text }
  })), { format: "SRT" });
}

function escapeAssText(value) {
  return String(value || "")
    .replace(/[{}\\]/g, "")
    .replace(/\r?\n/g, "\\N");
}

function assTime(milliseconds) {
  const centiseconds = Math.max(0, Math.round(milliseconds / 10));
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor(centiseconds / 6000) % 60;
  const seconds = Math.floor(centiseconds / 100) % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds % 100).padStart(2, "0")}`;
}

function toAss(cues, video = {}) {
  const width = Number(video.width) || 1920;
  const height = Number(video.height) || 1080;
  const header = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${width}\nPlayResY: ${height}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: bottom-caption,Noto Sans,54,&H00FFFFFF,&H00FFFFFF,&H99000000,&H88000000,0,0,0,0,100,100,0,0,3,2,0,5,0,0,0,1\nStyle: karaoke,Noto Sans,54,&H00FFFFFF,&H00999999,&H99000000,&H00000000,0,0,0,0,100,100,0,0,1,3,1,5,0,0,0,1\nStyle: minimal,Noto Sans,54,&H00FFFFFF,&H00FFFFFF,&H99000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,5,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  const events = cues.map((cue) => {
    const { settings } = cue;
    const layout = settings.layout;
    const x = Math.round(width * (layout.x + layout.width / 2) / 100);
    const y = Math.round(height * (layout.y + layout.height / 2) / 100);
    const fontSize = Math.round(settings.fontSize * height / 360);
    const bold = settings.fontWeight >= 600 ? 1 : 0;
    const marginL = Math.round(width * layout.x / 100);
    const marginR = Math.round(width * (100 - layout.x - layout.width) / 100);
    const prefix = `{\\an5\\pos(${x},${y})\\fs${fontSize}\\b${bold}}`;
    const content = settings.style === "karaoke" && Array.isArray(cue.words)
      ? cue.words.map((word, index) => {
        const previousEnd = index ? cue.words[index - 1].end : cue.start;
        const gap = Math.max(0, Math.round((word.start - previousEnd) / 10));
        const pause = gap ? `{\\k${gap}} ` : index ? " " : "";
        return `${pause}{\\k${Math.max(1, Math.round((word.end - word.start) / 10))}}${escapeAssText(word.text)}`;
      }).join("")
      : escapeAssText(cue.text);
    return `Dialogue: 0,${assTime(cue.start)},${assTime(cue.end)},${settings.style},,${marginL},${marginR},0,,${prefix}${content}`;
  });
  return `${header}${events.join("\n")}\n`;
}

module.exports = {
  approximateVoiceCues,
  buildCaptionTimeline,
  groupVoiceCues,
  normalizeCaptionSettings,
  parseSrtCues,
  toAss,
  toSrt
};
