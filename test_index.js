const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const scriptMatch = html.match(/<script>\s*(const translations =[\s\S]*?)<\/script>/);

if (scriptMatch) {
    const code = scriptMatch[1];
    try {
        // Evaluate the code using new Function or just run it to see if it throws a SyntaxError
        new Function(code);
        console.log("No syntax errors in index.html script block!");
    } catch (e) {
        console.error("Syntax Error in index.html:", e);
    }
} else {
    console.log("Script block not found!");
}
