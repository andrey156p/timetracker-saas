const fs = require('fs');
let admin = fs.readFileSync('public/admin.js', 'utf8');

// 1. Add unlock_trial and delete_client to dictionaries
admin = admin.replace(
    'save_changes: "Сохранить изменения", cancel: "Отмена"', 
    'save_changes: "Сохранить изменения", cancel: "Отмена", unlock_trial: "Снять ограничение", delete_client: "Удалить компанию"'
);
admin = admin.replace(
    'save_changes: "Save Changes", cancel: "Cancel"', 
    'save_changes: "Save Changes", cancel: "Cancel", unlock_trial: "Remove Trial", delete_client: "Delete Client"'
);
admin = admin.replace(
    'save_changes: "שמור שינויים", cancel: "ביטול",', 
    'save_changes: "שמור שינויים", cancel: "ביטול", unlock_trial: "בטל הגבלה", delete_client: "מחק לקוח",'
);

// 2. Change buttons in renderOwnerClients
const oldButtons = `<button onclick="unlockTrial('\${c.id}')" class="text-green-600 underline text-xs mr-2" \${!c.trialEndsAt ? 'hidden' : ''}>Unlock Trial</button>
                <button onclick="deleteForeman('\${c.id}')" class="text-red-600 underline text-xs mr-2" data-i18n="delete"></button>`;

const newButtons = `<button onclick="unlockTrial('\${c.id}')" class="text-green-600 font-bold underline text-xs mr-2" \${!c.trialEndsAt ? 'hidden' : ''} data-i18n="unlock_trial"></button>
                <button onclick="deleteForeman('\${c.id}')" class="text-red-600 underline text-xs mr-2" data-i18n="delete_client"></button>`;

admin = admin.replace(oldButtons, newButtons);

// 3. Change deleteForeman prompt
admin = admin.replace(
    "if (!confirm('Вы уверены, что хотите удалить этого прораба и все его данные (работники, счета, история)? Это действие нельзя отменить! / Are you sure?')) return;",
    "if (!confirm('ВНИМАНИЕ! Вы удаляете целую компанию/клиента и ВСЕ их данные (работников, счета, смены). Это действие необратимо! Вы уверены? / Delete client completely?')) return;"
);

// 4. Also fix unlockTrial to not have hardcoded prompt if possible, or just fix Russian translation
admin = admin.replace(
    "if (!confirm('Отменить триал и сделать аккаунт бессрочным? / Remove trial limit?')) return;",
    "if (!confirm('Снять ограничения пробного периода и сделать аккаунт бессрочным? / Remove trial limit?')) return;"
);

fs.writeFileSync('public/admin.js', admin, 'utf8');
console.log('Patched admin.js UI for owner dashboard to prevent accidental deletion');
