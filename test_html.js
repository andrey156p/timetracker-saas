const clients = [
  {
    id: '31288f76-6db4-4ee5-b510-8bd1a40413c4',
    username: 'marina',
    name: 'Marina Antonyan',
    isActive: true,
    trialEndsAt: null,
    tariffMode: 'per_hour',
    pricePerUser: 0,
    pricePerHour: 0.3
  }
];

let html = "";
clients.forEach(c => {
    let currentTariffStr = c.tariffMode === 'per_hour' ? `per_hour (${c.pricePerHour} ₪)` : `per_worker (${c.pricePerUser} ₪)`;
    let trialStr = c.trialEndsAt ? new Date(c.trialEndsAt).toLocaleDateString() : 'Бессрочный';
    if (c.trialEndsAt && new Date() > new Date(c.trialEndsAt)) {
        trialStr = `<span class="text-red-500 font-bold">Истек</span>`;
    }
    html += `<tr class="border-b hover:bg-gray-50">
        <td class="p-2">${c.name}</td>
        <td class="p-2">${c.username}</td>
        <td class="p-2">${c.isActive ? '✅' : '❌'}</td>
        <td class="p-2 text-sm">${trialStr}</td>
        <td class="p-2">
            <button onclick="toggleForeman('${c.id}')" class="text-blue-600 underline text-xs mr-2">${c.isActive ? 'block' : 'unblock'}</button>
            <button onclick="unlockTrial('${c.id}')" class="text-green-600 underline text-xs mr-2" ${!c.trialEndsAt ? 'hidden' : ''}>Unlock Trial</button>
        </td>
    </tr>`;
});
console.log(html);
