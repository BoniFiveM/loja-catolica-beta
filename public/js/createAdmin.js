const bcrypt = require('bcryptjs');

const hashedPassword = '$2a$10$PH/0cqkHJgJgTB6S3vI1luV92VH0qYDk4cNltSugIYTbLkf0VlPUq';
const plainPassword = '159159Mm!';  // A senha que você quer comparar

bcrypt.compare(plainPassword, hashedPassword)
  .then(isMatch => {
    console.log(isMatch); // true ou false
  })
  .catch(error => {
    console.error('Erro ao comparar senha:', error);
  });
