/**
 * ============================================================================
 * VIEW DO MAPA (TAILWIND REFACTOR)
 * ============================================================================
 */

import { GOOGLE_MAPS_API_KEY, USE_DEMO_MODE } from '../config/firebase.js';

let mapInstance = null;
let markers = [];

export function renderMapView(container, contacts) {
  // Container principal do mapa que ocupa o espaço restante da tela
  container.innerHTML = `
    <div class="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-surface pb-16 md:pb-0">
      
      <!-- Painel Lateral -->
      <div class="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-1/3 md:h-full z-10 shadow-soft">
        <div class="p-4 md:p-6 border-b border-slate-100">
          <h2 class="text-xl font-display font-bold text-slate-800">Mapa de Clientes</h2>
          <p class="text-sm text-slate-500 mt-1">Visualize a distribuição geográfica da sua base.</p>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3" id="map-contact-list">
          <!-- Renderizado dinamicamente -->
        </div>
      </div>

      <!-- Área do Mapa -->
      <div class="flex-1 relative h-2/3 md:h-full bg-slate-100">
        <div id="google-map" class="absolute inset-0"></div>
        ${!GOOGLE_MAPS_API_KEY ? `
          <div class="absolute inset-x-4 top-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl shadow-sm text-sm z-10 flex items-start gap-2 max-w-lg mx-auto">
            <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <span class="font-semibold block mb-1">Chave do Google Maps ausente</span>
              O mapa está rodando em modo de desenvolvimento restrito. Configure a VITE_GOOGLE_MAPS_API_KEY no .env para remover a marca d'água.
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Renderiza a lista na lateral
  const listContainer = document.getElementById('map-contact-list');
  if (contacts.length === 0) {
    listContainer.innerHTML = `<p class="text-slate-400 text-sm text-center mt-4">Nenhum contato cadastrado.</p>`;
  } else {
    listContainer.innerHTML = contacts.map(c => `
      <div class="p-3 bg-surface rounded-xl border border-slate-100 hover:border-brand-200 cursor-pointer transition-colors group" onclick="window.focusMarker('${c.id}')">
        <div class="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">${c.name}</div>
        <div class="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span class="truncate">${c.city} - ${c.state}</span>
        </div>
      </div>
    `).join('');
  }

  // Inicializa a API do Google Maps (se não estiver carregada)
  if (!window.google || !window.google.maps) {
    const script = document.createElement('script');
    const apiKey = GOOGLE_MAPS_API_KEY || ''; 
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    window.initGoogleMap = () => initMap(contacts);
    document.head.appendChild(script);
  } else {
    initMap(contacts);
  }
}

function initMap(contacts) {
  const mapElement = document.getElementById('google-map');
  if (!mapElement) return;

  mapInstance = new google.maps.Map(mapElement, {
    center: { lat: -14.235, lng: -51.925 }, // Centro do Brasil
    zoom: 4,
    disableDefaultUI: true,
    zoomControl: true,
  });

  const bounds = new google.maps.LatLngBounds();
  let hasValidCoords = false;

  contacts.forEach(contact => {
    // Simulação básica de coordenadas baseadas no CEP (para demonstração)
    // Em produção real com Geocoding API, converteríamos o endereço em Lat/Lng exata.
    // Aqui geramos leve dispersão em torno do centro para fins de demonstração visual se não tiver geocoding real
    if (contact.cep) {
      const pseudoLat = -23.55 + (parseInt(contact.cep.substring(0, 2)) || 0) * 0.1 - 2.5;
      const pseudoLng = -46.63 + (parseInt(contact.cep.substring(2, 4)) || 0) * 0.1 - 2.5;
      
      const position = { lat: pseudoLat, lng: pseudoLng };

      const isCliente = contact.type === 'cliente';
      const markerColor = isCliente ? '#bc9d87' : '#9ca3af';

      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: contact.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; font-family: Inter, sans-serif;">
            <strong style="color: #1e293b; font-size: 14px;">${contact.name}</strong><br>
            <span style="color: #64748b; font-size: 12px;">${contact.city} - ${contact.state}</span>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });

      markers.push({ id: contact.id, marker, infoWindow });
      bounds.extend(position);
      hasValidCoords = true;
    }
  });

  if (hasValidCoords) {
    mapInstance.fitBounds(bounds);
    // Impede zoom muito próximo se tiver apenas 1 ponto
    const listener = google.maps.event.addListener(mapInstance, "idle", function() { 
      if (mapInstance.getZoom() > 14) mapInstance.setZoom(14); 
      google.maps.event.removeListener(listener); 
    });
  }

  // Permite que o clique na lista focalize o marcador correspondente
  window.focusMarker = (id) => {
    const item = markers.find(m => m.id === id);
    if (item) {
      mapInstance.setZoom(15);
      mapInstance.panTo(item.marker.getPosition());
      item.infoWindow.open(mapInstance, item.marker);
    }
  };
}
