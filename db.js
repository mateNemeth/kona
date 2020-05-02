require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('knex')({
  client: 'pg',
  connection: `postgres://${process.env.POSTGRE_USER}:${porcess.env.POSTGRE_PASSWORD}@${process.env.POSTGRE_URL}`,
});

module.exports = db;
