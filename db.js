const db = require('knex')({
    client: 'pg',
    connection: 'postgres://matenemeth:password@localhost:5432/kona'
});

module.exports = db;