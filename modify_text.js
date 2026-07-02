const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Fix translations
html = html.replace(
    'The smartest GPS time tracking SaaS for construction, field workers, and mobile teams. Automatically deduct lunch, track overtime, and generate monthly reports.',
    'Universal GPS time tracking SaaS for businesses, field workers, and mobile teams. Perfect for construction, cleaning, logistics, and any field services. Automatically deduct lunch, track overtime, and generate monthly reports.'
);

html = html.replace(
    'Умный GPS-трекер рабочего времени для строителей, бригад и выездного персонала. Авто-отчеты и учет переработок.',
    'Универсальный GPS-трекер рабочего времени для бизнеса, бригад и выездного персонала. Идеально для строительства, клининга, доставок и любых выездных услуг. Авто-отчеты и учет переработок.'
);

html = html.replace(
    'מערכת דיווחי הנוכחות החכמה ביותר עם GPS לבנאים, צוותי שטח ועובדים ניידים.',
    'מערכת דיווחי הנוכחות האוניברסלית עם GPS לעסקים, צוותי שטח ועובדים ניידים. מושלם לבנייה, ניקיון, לוגיסטיקה וכל שירות שטח.'
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log("Updated copy to be universal.");
