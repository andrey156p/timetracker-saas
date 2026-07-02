const fs = require('fs');
const lines = fs.readFileSync('public/index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('getElementById(\'hero-title\')') || l.includes('getElementById(\'hero-btn-video\')') || l.includes('html: `')) {
        console.log(i + 1, l);
    }
});
