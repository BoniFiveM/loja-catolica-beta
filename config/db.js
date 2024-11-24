const { Pool } = require('pg'); // Importa o Pool do pacote pg

// Configuração do banco de dados
const pool = new Pool({
  user: 'boniarts', // Nome de usuário
  host: 'dpg-ct1923ggph6c73bgp7u0-a.oregon-postgres.render.com', // URL do banco externo
  database: 'boniarts', // Nome do banco de dados
  password: 'Z06f0sf4HCIxI4nHFehbb65W9lL1faIM', // Senha
  port: 5432, // Porta padrão do PostgreSQL
  ssl: { rejectUnauthorized: false }, // Necessário para conexões externas no Render
});

// Testando a conexão
console.log('Conectando ao banco de dados...');

pool.connect()
  .then(() => console.log('Conexão bem-sucedida ao banco de dados!'))
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1); // Sai do processo caso haja erro
  });

// Função para realizar uma consulta
const query = (text, params) => {
  console.log('Executando consulta:', text);
  return pool.query(text, params)
    .then(res => {
      console.log('Consulta bem-sucedida:', res.rows);
      return res.rows;
    })
    .catch(err => {
      console.error('Erro ao executar consulta:', err.message);
      throw err;
    });
};

// Exporta o pool e a função de consulta
module.exports = { query, pool };
