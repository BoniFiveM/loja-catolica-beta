
    // Abre o modal
    document.getElementById('open-login-modal').addEventListener('click', function(event) {
        event.preventDefault(); // Previne o comportamento padrão do link
        document.getElementById('login-modal').classList.remove('hidden');
    });

    // Fecha o modal ao clicar no "X"
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('login-modal').classList.add('hidden');
    });

    // Fecha o modal se o fundo for clicado
    document.getElementById('login-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            document.getElementById('login-modal').classList.add('hidden');
        }
    });

