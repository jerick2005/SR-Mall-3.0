const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin123',
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to local PostgreSQL on 5432 with admin123');
    client.end();
  })
  .catch(err => {
    console.error('FAILED: Could not connect to local PostgreSQL on 5432 with admin123', err.message);
    process.exit(1);
  });
