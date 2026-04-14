const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceDir = path.join(root, 'frontend');
const publicDir = path.join(root, 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

fs.rmSync(publicDir, { recursive: true, force: true });
copyRecursive(sourceDir, publicDir);
