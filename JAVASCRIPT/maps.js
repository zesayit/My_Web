// Iniciar todos os mapas com base nos IDs presentes no HTML
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map-estagio')) initMapaEstagio();
    if (document.getElementById('map-porto')) initMapaPorto();
    if (document.getElementById('map-trabalho')) initMapaTrabalho();
    if (document.getElementById('map-estudo')) initMapaEstudo();
});

// Configuração do mapa do Estágio
let mapEstagio;
function initMapaEstagio() {
    if (mapEstagio) {
        mapEstagio.remove();
    }

    mapEstagio = L.map('map-estagio', { zoomControl: false }).setView([41.15, -8.61], 12);

    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapEstagio);
    const ortofotoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles © Esri' });
    const mapaAbstrato = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; <a href="https://carto.com/">CARTO</a>' });
    const mapaEstradas = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; <a href="https://carto.com/">CARTO</a>' });

    const baseMaps = {
        "OpenStreetMap": openStreetMap,
        "Ortofotomapa": ortofotoLayer,
        "Mapa Abstrato": mapaAbstrato,
        "Mapa de Estradas": mapaEstradas
    };

    const overlayMaps = {};

    Promise.all([
        fetch('../DATA/arvores.geojson').then(res => res.json()),
        fetch('../DATA/paragens.geojson').then(res => res.json()),
        fetch('../DATA/linha.geojson').then(res => res.json())
    ]).then(([arvoresData, paragensData, linhaData]) => {
        const clusterGroup = carregarArvores(arvoresData);
        overlayMaps["Árvores em Clusters"] = clusterGroup;

        const heatmap = carregarHeatmap(arvoresData);
        overlayMaps["Heatmap das Árvores"] = heatmap;

        const paragensLayer = carregarParagens(paragensData);
        overlayMaps["Paragens do Metro"] = paragensLayer;

        const linhaLayer = carregarLinha(linhaData);
        overlayMaps["Linha de Fânzeres"] = linhaLayer;

        if (!mapEstagio.layerControl) {
            mapEstagio.layerControl = L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(mapEstagio);
        }

        const bounds = L.featureGroup([clusterGroup, paragensLayer, linhaLayer]).getBounds();
        mapEstagio.fitBounds(bounds, { padding: [50, 50] });
    }).catch(error => console.error("Erro ao carregar dados do mapa:", error));
}

function carregarArvores(data) {
    const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 30,
        disableClusteringAtZoom: 20,
        iconCreateFunction: function (cluster) {
            return L.divIcon({ 
                html: '<div style="background-color: rgba(0, 123, 255, 0.6); border-radius: 20px; padding: 5px 10px; color: white; font-size: 12px;">' + cluster.getChildCount() + '</div>',
                className: 'custom-cluster',
                iconSize: [30, 30]
            });
        }
    });

    const treeLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
            const marker = L.marker([feature.properties.latitude, feature.properties.longitude]);
            marker.on('click', () => {
                abrirSidebarArvore(feature);
            });
            return marker;
        }
    });

    clusterGroup.addLayer(treeLayer);
    return clusterGroup;
}

function carregarHeatmap(data) {
    const heatData = data.features.map(feature => [feature.properties.latitude, feature.properties.longitude, 0.5]);
    return L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.1: 'blue', 0.4: 'lime', 0.7: 'orange', 1.0: 'red' }
    });
}

function carregarParagens(data) {
    return L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#FF4500",
            color: "#FF4500",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }),
        onEachFeature: (feature, layer) => {
            const nomeParagem = feature.properties.Paragem || 'Paragem Desconhecida';
            layer.bindTooltip(nomeParagem, { 
                permanent: true,
                direction: 'top',
                offset: [0, -10],
                className: 'paragem-label'
            });
            layer.bindPopup(`<strong>Paragem:</strong> ${nomeParagem}`);
        }
    });
}

function carregarLinha(data) {
    return L.geoJSON(data, {
        style: { color: "#1E90FF", weight: 3, opacity: 0.7, fillOpacity: 0.1 }
    });
}

function abrirSidebarArvore(feature) {
    const sidebar = document.getElementById('info-sidebar');
    const sidebarContent = document.getElementById('sidebar-content');

    sidebarContent.innerHTML = `
        <h3>${feature.properties.Especie}</h3>
        <strong>Nome comum:</strong> ${feature.properties.Nome}<br>
        <strong>Altura:</strong> ${feature.properties.H_m} m<br>
        <strong>DAP:</strong> ${feature.properties.DAP_cm} cm<br>
        <a href="https://www.google.com/search?q=${encodeURIComponent(feature.properties.Especie)}" target="_blank">Mais sobre esta espécie</a><br>
        <img src="../IMAGES/${feature.properties.photo_arv}" alt="Foto da Árvore" style="width:100%; max-height:100%; object-fit:cover;" />
    `;

    sidebar.classList.remove('hidden');

    document.getElementById('close-sidebar').addEventListener('click', () => {
        sidebar.classList.add('hidden');
    });
}

// Configuração de outros mapas
function initMapaPorto() {
    const mapPorto = L.map('map-porto').setView([41.15, -8.61], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapPorto);

    L.marker([41.15, -8.61]).addTo(mapPorto)
        .bindPopup('Porto - Cidade onde nasci')
        .openPopup();
}

function initMapaTrabalho() {
    const mapTrabalho = L.map('map-trabalho').setView([39.5, -8.0], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapTrabalho);

    const markersTrabalho = [
        L.marker([41.18, -8.62]).bindPopup('ECOREDE - Supervisor de Operações Florestais'),
        L.marker([41.13, -7.74]).bindPopup('IBER KING - Operador Aprendiz'),
        L.marker([51.30, 3.06]).bindPopup('RYCKEBOER - Assistente de Cozinha'),
        L.marker([41.25, -8.46]).bindPopup('Voluntariado Jovem para a Natureza e Floresta'),
    ];
    markersTrabalho.forEach(marker => marker.addTo(mapTrabalho));
    mapTrabalho.fitBounds(L.featureGroup(markersTrabalho).getBounds());
}

function initMapaEstudo() {
    const mapEstudo = L.map('map-estudo').setView([41.15, -8.61], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapEstudo);

    const markersEstudo = [
        L.marker([41.15, -8.61]).bindPopup('Universidade do Porto'),
        L.marker([41.30, -7.74]).bindPopup('Universidade de Trás-os-Montes e Alto Douro'),
        L.marker([45.75, 21.23]).bindPopup('Universidade de Vest Timișoara'),
    ];
    markersEstudo.forEach(marker => marker.addTo(mapEstudo));
    mapEstudo.fitBounds(L.featureGroup(markersEstudo).getBounds());
}
