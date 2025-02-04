document.addEventListener('DOMContentLoaded', () => {
    // Inicializar mapas
    if (typeof L === 'undefined') {
        carregarLeaflet(inicializarMapas);
    } else {
        inicializarMapas();
    }

    // Inicializar menu
    if (typeof initMenu === 'function') {
        initMenu();
    }

    // Inicializar tema escuro/claro
    inicializarTema();

    // Inicializar transições suaves
    inicializarTransicoes();

    // Adicionar secções dinâmicas
    adicionarSecao("Projetos de 2025", "Este ano, desenvolvi novos mapas interativos focados na biodiversidade urbana.");
});

// Função para carregar Leaflet dinamicamente
function carregarLeaflet(callback) {
    if (typeof L !== 'undefined') {
        callback();
        return;
    }

    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    leafletJS.onload = callback;
    document.body.appendChild(leafletJS);
}

// Inicializar mapas com base nos IDs presentes no HTML
function inicializarMapas() {
    if (document.getElementById('map-porto')) initMapaPorto();
    if (document.getElementById('map-trabalho')) initMapaTrabalho();
    if (document.getElementById('map-estudo')) initMapaEstudo();
    if (document.getElementById('map-estagio')) initMapaEstagio();
}

// Função para alternar o tema escuro/claro
function inicializarTema() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// Função para transições suaves entre páginas
function inicializarTransicoes() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = link.href;
                }, 300);
            }
        });
    });
}

// Função para adicionar secções dinâmicas
function adicionarSecao(titulo, conteudo) {
    const secao = document.createElement('section');
    secao.innerHTML = `
        <h2>${titulo}</h2>
        <p>${conteudo}</p>
    `;
    document.querySelector('main').appendChild(secao);
}

// Função para carregar automaticamente todos os dados GeoJSON
function carregarTodosOsDados() {
    const ficheiros = ['arvores.geojson', 'paragens.geojson', 'linha.geojson'];

    ficheiros.forEach(ficheiro => {
        fetch(`../DATA/${ficheiro}`)
            .then(response => response.json())
            .then(data => {
                if (ficheiro.includes('arvores')) {
                    carregarArvores(data);
                } else if (ficheiro.includes('paragens')) {
                    carregarParagens(data);
                } else if (ficheiro.includes('linha')) {
                    carregarLinha(data);
                }
            })
            .catch(error => console.error(`Erro ao carregar o ficheiro ${ficheiro}:`, error));
    });
}
