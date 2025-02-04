function initMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        // Função para abrir/fechar o menu
        menuToggle.onclick = () => nav.classList.toggle('active');
    }

    // Fechar o menu automaticamente ao clicar em qualquer link
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.textContent.toLowerCase() === 'coming soon...') {
                e.preventDefault();
                mostrarVideoShrek();
            } else if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    });
}

// Função para adicionar novos itens de menu dinamicamente
function adicionarItemMenu(texto, link) {
    const nav = document.querySelector('.nav ul');
    const novoItem = document.createElement('li');
    novoItem.innerHTML = `<a href="#">${texto}</a>`;
    nav.appendChild(novoItem);

    // Adiciona evento ao novo item
    novoItem.querySelector('a').addEventListener('click', (e) => {
        if (texto.toLowerCase() === 'coming soon...') {
            e.preventDefault();
            mostrarVideoShrek();
        }
    });
}

// Exemplo de como adicionar novos itens no futuro
adicionarItemMenu('coming soon...', '#');

// Função para mostrar o vídeo
function mostrarVideoShrek() {
    document.body.innerHTML = `
        <h1 style="text-align: center; margin-top: 20px;">While you wait, watch this Shrek video</h1>
        <div style="display: flex; justify-content: center; align-items: center; height: 80vh;">
            <iframe src="https://www.youtube.com/embed/8TLVvRH_cd8?autoplay=1&loop=1&playlist=8TLVvRH_cd8"
                    width="315" height="560" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
            </iframe>
        </div>`;
}

document.addEventListener('DOMContentLoaded', initMenu);
