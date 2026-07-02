const fs = require('fs');

let admin = fs.readFileSync('public/admin.js', 'utf8');

const targetRegex = /\/\/ Tab icon\s+const icon = document.createElement\('div'\);\s+icon.className = "w-4 h-4 bg-blue-500 rounded-full mr-2 opacity-80 flex-shrink-0";\s+if\(userRole === 'owner'\) icon.classList.replace\('bg-blue-500', 'bg-purple-500'\);/;

const replacement = `// Tab icon
        const icon = document.createElement('div');
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'];
        const colorClass = colors[tabs.indexOf(tab) % colors.length];
        icon.className = \`w-4 h-4 \${colorClass} rounded-full mr-2 opacity-80 flex-shrink-0\`;`;

if (targetRegex.test(admin)) {
    admin = admin.replace(targetRegex, replacement);
    fs.writeFileSync('public/admin.js', admin, 'utf8');
    console.log("Replaced colors successfully.");
} else {
    console.log("Could not find the target string.");
}
