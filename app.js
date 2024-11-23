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

// Função de middleware para garantir que o usuário esteja logado
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // Se o usuário estiver logado, prossegue com a requisição
  } else {
    return res.status(401).send('Você precisa estar logado para adicionar produtos ao carrinho');
  }
}

// Rota Home
app.get('/', async (req, res) => {
  try {
    // Consulta ao banco de dados para obter os produtos
    const produtos = await pool.query('SELECT * FROM products');
    
    // Recuperando os dados do usuário da sessão (ou outro método de autenticação)
    const user = req.session.user || null;  // Altere conforme sua lógica de autenticação

    // Passando as variáveis 'produtos' e 'user' para a view
    res.render('index', { produtos: produtos.rows, user: user });
  } catch (err) {
    console.error('Erro ao consultar produtos:', err);
    res.status(500).send('Erro ao buscar produtos');
  }
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

// Middleware para inicializar o carrinho na sessão
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// Rota para adicionar itens ao carrinho com verificação de login
app.post('/cart/add', ensureAuthenticated, (req, res) => {
  const { productId, productName, price, quantity } = req.body;

  const existingProduct = req.session.cart.find(item => item.productId === productId);

  if (existingProduct) {
    existingProduct.quantity += parseInt(quantity, 10); // Incrementa a quantidade
  } else {
    req.session.cart.push({
      productId,
      productName,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10)
    });
  }

  res.json({ cart: req.session.cart });
});

// Rota para exibir o carrinho com verificação de login
app.get('/cart', ensureAuthenticated, (req, res) => {
  res.json(req.session.cart); // Retorna os itens do carrinho
});

// Rota para limpar o carrinho
app.post('/cart/clear', (req, res) => {
  req.session.cart = [];
  res.json({ message: 'Carrinho limpo com sucesso!' });
});

// Rota de compra com verificação de login
app.post('/purchase', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { cart } = req.session;

  if (cart.length === 0) {
    return res.status(400).send('Carrinho vazio. Adicione produtos ao carrinho antes de comprar.');
  }

  try {
    await pool.query('INSERT INTO purchases (user_id, items) VALUES ($1, $2)', [userId, JSON.stringify(cart)]);

    req.session.cart = [];

    res.json({ message: 'Compra realizada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar a compra');
  }
});
// Rota para exibir os produtos na página principal
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    const products = result.rows;
    
    res.render('index', { produtos: products }); // Passando a lista de produtos para a view
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).send('Erro ao carregar produtos');
  }
});



app.get('/produto/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }

    const product = productResult.rows[0];
    const user = req.session.user || null;

    res.render('produtoView', { product: product, user: user });
  } catch (err) {
    console.error('Erro ao consultar produto:', err);
    res.status(500).send('Erro ao buscar produto');
  }
});

// Rota para exibir os detalhes do produto
// Rota para exibir os detalhes do produto
app.get('/produtoView/:id', async (req, res) => {
  try {
    const productId = req.params.id; // Obter o ID do produto da URL.

    // Consulta ao banco para buscar o produto com o ID correto.
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (result.rows.length === 0) {
      return res.status(404).send('Produto não encontrado.');
    }

    const product = result.rows[0];
    const user = req.session.user || null;

    res.render('produtoView', { product, user });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).send('Erro ao buscar produto.');
  }
});





// Rota para o painel administrativo
// Rota para o painel administrativo
app.get('/admin', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Acesso negado! Você não tem permissão para acessar o painel administrativo.');
  }

  try {
    // Consulta os produtos no banco de dados
    const result = await pool.query('SELECT * FROM products');
    const products = result.rows;

    // Passa os produtos para a view
    res.render('admin', { produtos: products });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).send('Erro ao carregar produtos');
  }
});


// Rota para exibir a página de login do admin
app.get('/admin/login', (req, res) => {
  res.render('adminLogin');
});
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica o e-mail no banco
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('Usuário não encontrado');
      return res.status(400).send('Usuário não encontrado');
    }

    const user = result.rows[0];

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Senha incorreta');
      return res.status(400).send('Senha incorreta');
    }

    // Autenticação bem-sucedida
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin'
    };
    return res.redirect('/admin');
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro no servidor');
  }
});
;


app.post('/admin/products', async (req, res) => {
  const user = req.session.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).send('Acesso negado! Apenas administradores podem adicionar produtos.');
  }

  try {
    const { productName, productPrice, productDescription, productImage } = req.body;

    const query = `
      INSERT INTO products (name, price, description, image_url)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [productName, productPrice, productDescription, productImage];

    await pool.query(query, values);

    res.status(201).send('Produto adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).send('Erro ao adicionar produto.');
  }
});




// Rota de logout para o admin
app.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Erro ao deslogar');
    }
    res.redirect('/admin/login');
  });
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
