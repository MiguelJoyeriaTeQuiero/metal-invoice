require('dotenv').config({ path: '.env' });

console.log('ADMIN_EMAIL:', JSON.stringify(process.env.ADMIN_EMAIL));
console.log('ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));
console.log('NEXTAUTH_SECRET:', JSON.stringify(process.env.NEXTAUTH_SECRET));