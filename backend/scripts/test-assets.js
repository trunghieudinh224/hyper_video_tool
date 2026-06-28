"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-assets-test-"));
process.env.HVT_DATABASE_PATH = path.join(testRoot, "test.sqlite");
process.env.HVT_UPLOADS_DIR = path.join(testRoot, "uploads");
process.env.HVT_UPLOAD_IMAGE_MAX_MB = "1";

const { deleteAsset, getAsset, listAssets } = require("../src/db/database");
const { uploadAssets } = require("../src/routes/assets");
const { localizeRenderAssets } = require("../src/render/render-runner");
const { deleteAssetFile, isSafeAssetFile } = require("../src/storage/asset-store");

const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");

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

  await assert.rejects(
    uploadAssets(multipartRequest([
      { name: "valid.png", type: "image/png", content: PNG_BYTES },
      { name: "fake.png", type: "image/png", content: Buffer.from("not a png") }
    ]), "current"),
    /does not match/
  );
  assert.deepEqual(listAssets("current").map((item) => item.id), [asset.id]);
  assert.equal(fs.readdirSync(path.join(testRoot, "uploads", "current")).length, 1);

  await assert.rejects(
    uploadAssets(multipartRequest([
      { name: "large.png", type: "image/png", content: Buffer.concat([PNG_BYTES, Buffer.alloc(1024 * 1024)]) }
    ]), "current"),
    /too large/
  );
  assert.equal(fs.readdirSync(path.join(testRoot, "uploads", "current")).length, 1);

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
  assert.equal(listAssets("current").length, 0);
}

run()
  .then(() => process.stdout.write("Asset persistence tests passed.\n"))
  .finally(() => fs.rmSync(testRoot, { recursive: true, force: true }));
