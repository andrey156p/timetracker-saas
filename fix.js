const fs = require('fs');
let c = fs.readFileSync('public/admin.js', 'utf8');

if (!c.includes('function showToast')) {
    c = c.replace("const API_URL = '/api';", "const API_URL = '/api';\n\nfunction showToast(msg, isError=false){\n    if(typeof Swal !== 'undefined'){\n        Swal.fire({\n            toast:true, \n            position:'top-end', \n            showConfirmButton:false, \n            timer:3000, \n            title:msg, \n            icon:isError?'error':'info'\n        });\n    } else {\n        alert(msg);\n    }\n}\n");
}

c = c.replace(/alert\((['"`][^'"`]+?['"`])\)/g, 'showToast($1)');
c = c.replace(/alert\((r\.error)\)/g, 'showToast($1, true)');
c = c.replace(/alert\((r\.error \|\|.+?)\)/g, 'showToast($1, true)');
c = c.replace(/alert\((.+?\.message.+?)\)/g, 'showToast($1, true)');

fs.writeFileSync('public/admin.js', c);
console.log("Done");
