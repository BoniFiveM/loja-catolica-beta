const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // De acordo com a variável POSTGRES_USER
  host: 'localhost', // Insira o domínio público completo sem os `${}`
  database: 'marcos', // De acordo com a variável POSTGRES_DB
  password: 'marcos', // De acordo com a variável POSTGRES_PASSWORD
  port: 5432, // De acordo com a variável PGPORT
});

pool.connect()
  .then(() => console.log('Conexão bem-sucedida!'))
  .catch(err => console.error('Erro na conexão:', err));
