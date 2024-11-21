const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const pool = require('./config/db');
const app = express();

// Configuração para usar o EJS e o express.static
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secreta',
  resave: false,
  saveUninitialized: false,
}));

// Rota Home
// Rota para exibir a página principal após login
app.get('/', (req, res) => {
  // Se o usuário estiver logado (sessão válida), passamos as informações para o template
  if (req.session.user) {
      return res.render('index', { user: req.session.user });
  }
  // Se o usuário não estiver logado, passa um objeto vazio (ou redireciona para a tela de login)
  return res.render('index', { user: null });
});


// Rota de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o email existe no banco
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length > 0) {
    const user = result.rows[0];

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      return res.redirect('/');
    } else {
      return res.status(400).send('Senha incorreta');
    }
  }

  return res.status(400).send('Usuário não encontrado');
});

// Rota de registro
app.post('/register', async (req, res) => {
  const { name, email, password, city, phone } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (name, email, password, city, phone) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, city, phone]
    );
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao registrar usuário');
  }
});

// Rota de logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Erro ao deslogar');
    }
    res.redirect('/');
  });
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
