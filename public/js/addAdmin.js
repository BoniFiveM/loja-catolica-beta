const bcrypt = require('bcryptjs');
const pool = require('./config/db');  // Ou o caminho correto do seu pool de banco de dados

async function addAdmin() {
  // Dados do administrador
  const adminEmail = 'boni3422';
  const adminPassword = 'boniadmin';

  // Hash da senha
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Inserir o novo administrador na tabela admin_users
    await pool.query(
      'INSERT INTO admin_users (name, email, password) VALUES ($1, $2, $3)',
      ['Boni', adminEmail, hashedPassword]
    );

    console.log('Administrador adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar administrador:', error);
  }
}

// Chama a função para adicionar o admin
addAdmin();
