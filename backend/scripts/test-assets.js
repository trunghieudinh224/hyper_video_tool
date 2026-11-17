"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { PassThrough, Readable } = require("node:stream");

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-assets-test-"));
process.env.HVT_DATABASE_PATH = path.join(testRoot, "test.sqlite");
process.env.HVT_UPLOADS_DIR = path.join(testRoot, "uploads");
process.env.HVT_UPLOAD_IMAGE_MAX_MB = "1";

const { deleteAsset, getAsset, listAssets } = require("../src/db/database");
const { sendAssetFile, uploadAssets } = require("../src/routes/assets");
const { localizeRenderAssets } = require("../src/render/render-runner");
const { deleteAssetFile, isSafeAssetFile } = require("../src/storage/asset-store");

const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const MP3_BYTES = Buffer.concat([Buffer.from("ID3", "ascii"), Buffer.alloc(13)]);

function multipartRequest(files, fields = {}) {
  const boundary = `----hvt-test-${Date.now()}`;
  const chunks = [];
  Object.entries(fields).forEach(([name, value]) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  });
  files.forEach((file) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`));
    chunks.push(file.content);
    chunks.push(Buffer.from("\r\n"));
  });
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const request = Readable.from(chunks);
  request.headers = { "content-type": `multipart/form-data; boundary=${boundary}` };
  return request;
}

function readAssetResponse(asset, method = "GET", range = "") {
  return new Promise((resolve, reject) => {
    const response = new PassThrough();
    const chunks = [];
    let statusCode = 0;
    let headers = {};
    response.writeHead = (status, responseHeaders) => {
      statusCode = status;
      headers = responseHeaders;
    };
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("error", reject);
    response.on("end", () => resolve({ statusCode, headers, body: Buffer.concat(chunks) }));
    sendAssetFile({ method, headers: range ? { range } : {} }, response, asset);
  });
}

async function run() {
  const [asset] = await uploadAssets(multipartRequest([
    { name: "logo.png", type: "image/png", content: PNG_BYTES }
  ], { type: "logo" }), "current");
  assert.equal(asset.type, "logo");
  assert.equal("filePath" in asset, false);
  const storedAsset = getAsset(asset.id, "current");
  assert.equal(storedAsset.id, asset.id);
  assert.equal(getAsset(asset.id, "another-project"), null);
  assert.equal(isSafeAssetFile(storedAsset.filePath), true);

  const [audioAsset] = await uploadAssets(multipartRequest([
    { name: "background-music.mp3", type: "audio/mpeg", content: MP3_BYTES }
  ], { type: "audio" }), "current");
  assert.equal(audioAsset.type, "audio");
  assert.equal(audioAsset.mimeType, "audio/mpeg");
  const storedAudio = getAsset(audioAsset.id, "current");
  assert.equal(isSafeAssetFile(storedAudio.filePath), true);
  const fullResponse = await readAssetResponse(storedAudio);
  assert.equal(fullResponse.statusCode, 200);
  assert.equal(fullResponse.headers["Content-Length"], MP3_BYTES.length);
  assert.deepEqual(fullResponse.body, MP3_BYTES);
  const partialResponse = await readAssetResponse(storedAudio, "GET", "bytes=0-2");
  assert.equal(partialResponse.statusCode, 206);
  assert.equal(partialResponse.headers["Content-Range"], `bytes 0-2/${MP3_BYTES.length}`);
  assert.deepEqual(partialResponse.body, MP3_BYTES.subarray(0, 3));
  const suffixResponse = await readAssetResponse(storedAudio, "GET", "bytes=-3");
  assert.equal(suffixResponse.statusCode, 206);
  assert.deepEqual(suffixResponse.body, MP3_BYTES.subarray(-3));
  const headResponse = await readAssetResponse(storedAudio, "HEAD", "bytes=0-2");
  assert.equal(headResponse.statusCode, 206);
  assert.equal(headResponse.headers["Content-Length"], 3);
  assert.equal(headResponse.body.length, 0);
  const invalidResponse = await readAssetResponse(storedAudio, "GET", "bytes=999-");
  assert.equal(invalidResponse.statusCode, 416);
  assert.equal(invalidResponse.headers["Content-Range"], `bytes */${MP3_BYTES.length}`);
  assert.equal(invalidResponse.body.length, 0);

  await assert.rejects(
    uploadAssets(multipartRequest([
      { name: "valid.png", type: "image/png", content: PNG_BYTES },
      { name: "fake.png", type: "image/png", content: Buffer.from("not a png") }
    ]), "current"),
    /does not match/
  );
  assert.deepEqual(listAssets("current").map((item) => item.id), [audioAsset.id, asset.id]);
  assert.equal(fs.readdirSync(path.join(testRoot, "uploads", "current")).length, 2);

  await assert.rejects(
    uploadAssets(multipartRequest([
      { name: "large.png", type: "image/png", content: Buffer.concat([PNG_BYTES, Buffer.alloc(1024 * 1024)]) }
    ]), "current"),
    /too large/
  );
  assert.equal(fs.readdirSync(path.join(testRoot, "uploads", "current")).length, 2);

  const compositionDir = path.join(testRoot, "composition");
  fs.mkdirSync(compositionDir, { recursive: true });
  const localized = localizeRenderAssets({
    assets: { logo: asset, screenshots: [], videos: [], all: [asset] }
  }, compositionDir);
  assert.match(localized.assets.logo.url, /^assets\//);
  assert.equal(localized.assets.all[0].url, localized.assets.logo.url);
  assert.equal(fs.existsSync(path.join(compositionDir, localized.assets.logo.url)), true);

  assert.equal(isSafeAssetFile(path.join(testRoot, "outside.png")), false);
  deleteAssetFile(storedAsset.filePath);
  deleteAsset(asset.id, "current");
  deleteAssetFile(getAsset(audioAsset.id, "current").filePath);
  deleteAsset(audioAsset.id, "current");
  assert.equal(listAssets("current").length, 0);
}

run()
  .then(() => process.stdout.write("Asset persistence tests passed.\n"))
  .finally(() => fs.rmSync(testRoot, { recursive: true, force: true }));
