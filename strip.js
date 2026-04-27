const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('wifi_pro');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    content = content.replace(/<!--[\s\S]*?-->/g, '');
  } else if (file.endsWith('.css')) {
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  } else if (file.endsWith('.js')) {
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    let newLines = [];
    content.split('\n').forEach(line => {
      let trimmed = line.trim();
      if (!trimmed.startsWith('//')) {
         let newL = line;
         let commentIdx = line.indexOf('//');
         if (commentIdx > -1 && !line.includes('http://') && !line.includes('https://') && !line.includes('ws://')) {
            newL = line.substring(0, commentIdx);
         }
         newLines.push(newL);
      }
    });
    content = newLines.join('\n');
  }
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Comments stripped.');