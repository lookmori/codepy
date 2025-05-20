// 自动复制 Monaco Editor 静态资源到 public/monaco/vs
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const monacoSrc = path.join(__dirname, '../node_modules/monaco-editor/min/vs');
const monacoDest = path.join(__dirname, '../public/monaco/vs');

copyDir(monacoSrc, monacoDest);

console.log('Monaco Editor 静态资源已复制到 public/monaco/vs'); 