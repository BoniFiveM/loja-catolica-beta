document.addEventListener('DOMContentLoaded', () => {
    const cart = []; // Carrinho de compras
    const cartCountElement = document.getElementById('cart-count'); // Atualizar contador no ícone do carrinho
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // Função para atualizar o carrinho
    const updateCart = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems; // Atualiza o contador no ícone do carrinho

        console.clear();
        console.log("Carrinho Atualizado:", cart);
    };

    // Adicionar produto ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productElement = e.target.closest('.product');
            const productId = productElement.dataset.id;
            const productName = productElement.dataset.name;
            const productPrice = parseFloat(productElement.dataset.price);
            const productImage = productElement.dataset.image; // Captura a imagem
            const quantity = parseInt(productElement.querySelector('.product-quantity').value);

            if (quantity <= 0) {
                alert("Por favor, escolha uma quantidade válida!");
                return;
            }

            const existingProduct = cart.find(item => item.id === productId);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage, // Adiciona a imagem ao carrinho
                    quantity: quantity
                });
            }

            updateCart();
        });
    });

    // Modal do carrinho
    const cartModal = document.getElementById('cart-modal');
    const cartItemsList = document.getElementById('cart-items');
    const closeCartButton = document.getElementById('close-cart');
    
    // Exibe o modal ao clicar no ícone do carrinho
    document.querySelector('.fa-shopping-cart').addEventListener('click', (e) => {
        e.preventDefault(); // Previne a navegação padrão do link

        cartItemsList.innerHTML = ''; // Limpa os itens anteriores do carrinho
        cart.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between items-center'; // Alinha a imagem e o texto
            listItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-image" style="width: 50px; height: 50px; margin-right: 10px;">
                <span>${item.name} (x${item.quantity})</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartItemsList.appendChild(listItem);
        });

        cartModal.classList.remove('hidden'); // Exibe o modal
    });

    // Fecha o modal
    closeCartButton.addEventListener('click', () => {
        cartModal.classList.add('hidden'); // Fecha o modal ao adicionar a classe "hidden"
    });
});
