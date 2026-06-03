const fs = require("fs");
const path = require("path");

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
};

const cesiumBase = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const publicDest = path.join(__dirname, "..", "public", "cesium");

if (!fs.existsSync(publicDest)) fs.mkdirSync(publicDest, { recursive: true });

// Copy the main UMD bundle (this is what the <script> tag loads)
fs.copyFileSync(path.join(cesiumBase, "Cesium.js"), path.join(publicDest, "Cesium.js"));
console.log("Copied cesium/Cesium.js");

for (const dir of ["Workers", "ThirdParty", "Assets", "Widgets"]) {
  copyDir(path.join(cesiumBase, dir), path.join(publicDest, dir));
  console.log(`Copied cesium/${dir}`);
}
