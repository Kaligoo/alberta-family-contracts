const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:');
  console.log(hash);
});