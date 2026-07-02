const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace \` with `
html = html.replace(/\\`/g, '`');

// Replace \${ with ${
html = html.replace(/\\\${/g, '${');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log("Fixed backslash escapes in index.html");
