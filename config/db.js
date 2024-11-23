const { Pool } = require('pg'); // Importa o Pool do pacote pg

// Configuração do banco de dados
const pool = new Pool({
  user: 'boniarts',           // Substitua pelo seu usuário do PostgreSQL
  host: 'localhost',          // Endereço do servidor do banco de dados (pode ser localhost ou IP)
  database: 'boniarts',       // Nome do banco de dados
  password: 'novaSenha',      // Senha do banco de dados
  port: 5432,                 // Porta padrão do PostgreSQL
});

// Exibe a conexão
console.log('Conectando ao banco de dados...');

// Função para realizar uma consulta
const query = (text, params) => {
  console.log('Consultando:', text, 'com parâmetros:', params); // Exibe a consulta e os parâmetros
  return pool.query(text, params)
    .then(res => {
      console.log('Consulta realizada com sucesso:', res.rows); // Exibe o resultado da consulta
      return res;
    })
    .catch(err => {
      console.error('Erro ao realizar consulta:', err.message); // Exibe mais informações sobre o erro
      if (err.table) {
        console.error('Tabela:', err.table); // Caso o erro esteja relacionado à tabela
      }
      throw err;
    });
};

// Testando a conexão (verifica se a conexão foi bem-sucedida)
pool.connect()
  .then(() => console.log('Conexão bem-sucedida ao banco de dados'))
  .catch(err => console.error('Erro ao conectar ao banco de dados', err));

// Exportando a função de consulta
module.exports = { query };
