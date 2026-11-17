# Media libraries vendored for Hyper Video Tool

These browser builds are copied byte-for-byte from the official npm packages. HVT loads them locally; no CDN or frontend build step is needed.

| File | Package | Version | License | SHA-256 |
| --- | --- | --- | --- | --- |
| `mediabunny-1.66.0.min.js` | [mediabunny](https://github.com/Vanilagy/mediabunny) | 1.66.0 | MPL-2.0, `mediabunny-LICENSE.txt` | `515308bfb924787acc9247f3f9da759ec78cce93b67a5037ed08f9ae46849ea1` |
| `wavesurfer-8.1.0.min.js` | [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | 8.1.0 | BSD-3-Clause, `wavesurfer-LICENSE.txt` | `9ede2d605b9b92ab3c4d9062ac53d56890e72809ea38f0394573a6672c7419f7` |

Source package archives: `https://registry.npmjs.org/mediabunny/-/mediabunny-1.66.0.tgz` and `https://registry.npmjs.org/wavesurfer.js/-/wavesurfer.js-8.1.0.tgz`. Before upgrading, check upstream release notes and license, then replace both build and license file together. Keep the version in the filename and update the script paths in `frontend/pages/assets.html`.
