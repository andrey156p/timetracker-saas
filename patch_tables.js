const fs = require('fs');
let code = fs.readFileSync('public/admin.js', 'utf8');

// We can just use string replacements for the exact strings
const tableTags = [
    '<table class="w-full text-left border-collapse bg-white shadow rounded">',
    '<table class="w-full text-left border-collapse text-sm min-w-[800px]" id="schedule-matrix">',
    '<table class="w-full text-left border-collapse text-sm employee-table-export">',
    '<table class="w-full text-sm text-left">'
];

tableTags.forEach(tag => {
    // Replace <table ...> with <div class="overflow-x-auto w-full pb-2"><table ...>
    code = code.split(tag).join('<div class="overflow-x-auto w-full pb-2">' + tag);
});

// Now we need to append </div> after </table>
// But wait, there might be </table> tags that already have wrappers. Let's just do it dynamically.
// Actually, it's safer to just replace '</tbody></table>' with '</tbody></table></div>'
// but there might be '</table>' without '</tbody>'. Let's do '</table>'
// Wait, if I replace all '</table>', it might wrap things I didn't open.
// Since there are exactly 7 tables, let's count them.

let count = (code.match(/<div class="overflow-x-auto w-full pb-2"><table/g) || []).length;
console.log("Replaced tables: " + count);

// We replace all '</table>' with '</table></div>' since we wrapped ALL tables.
// Wait! Is there any table NOT in the array above?
const otherTables = (code.match(/<table/g) || []).length;
console.log("Total tables: " + otherTables);

if (count === otherTables) {
    code = code.split('</table>').join('</table></div>');
} else {
    console.error("Mismatch in table counts!");
    process.exit(1);
}

fs.writeFileSync('public/admin.js', code, 'utf8');
console.log('Tables patched successfully');
