const fs = require('fs');
let code = fs.readFileSync('public/admin.js', 'utf8');

// remove the stray artifacts
code = code.replace(/= window\.jspdf;\s*for \(const \[empId, data\] of Object\.entries\(workers\)\) \{\s*const doc = new jsPDF\(\);[\s\S]*?doc\.save\(`Timesheet_\$\{empId\}_\$\{month\}\.pdf`\);\s*\}/, "");

fs.writeFileSync('public/admin.js', code, 'utf8');
console.log("Cleaned up admin.js");
