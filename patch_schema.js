const fs = require('fs');
let schema = fs.readFileSync('schema.prisma', 'utf8');

if (!schema.includes('model ContactRequest')) {
    schema += `
model ContactRequest {
  id        String   @id @default(uuid())
  name      String
  company   String
  email     String?
  phone     String?
  createdAt DateTime @default(now())
}
`;
    fs.writeFileSync('schema.prisma', schema, 'utf8');
    console.log("ContactRequest model added.");
} else {
    console.log("ContactRequest already exists.");
}
