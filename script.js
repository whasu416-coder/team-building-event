document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Offset for slightly better viewing position
        const offset = 20;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetElement.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        // Respect reduced motion settings
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  // Initialize Leaflet Map with multiple markers
  initLeafletMap();
});

function initLeafletMap() {
  const mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer) return;

  // 1. Coordinates and info for accommodation and facilities
  const positions = {
    lodging: {
      lat: 35.967812,
      lng: 126.711832,
      title: "🏠 숙소 (오투그란데 306동)",
      desc: "군산수송제일오투그란데1단지 306동 (출발점)",
      no: "🏠",
      markerClass: "lodging-marker"
    },
    lotteMart: {
      lat: 35.964724,
      lng: 126.716392,
      title: "1️⃣ 롯데마트 군산점",
      desc: "대형마트 · 생필품 및 간식 구매 (도보 약 8~10분)",
      no: "1",
      markerClass: "facility-marker-blue",
      id: "lotte-mart"
    },
    daiso: {
      lat: 35.962649,
      lng: 126.715225,
      title: "2️⃣ 다이소 군산점",
      desc: "생활용품 · 소모품 및 기타 용품 구매 (도보 약 6~8분)",
      no: "2",
      markerClass: "facility-marker-teal",
      id: "daiso"
    },
    convenience: {
      lat: 35.966089,
      lng: 126.711365,
      title: "3️⃣ 가까운 편의점 (GS25 수송오투점)",
      desc: "편의점 · 간단한 간식 및 음료 구매 (도보 약 3~5분)",
      no: "3",
      markerClass: "facility-marker-blue",
      id: "convenience"
    },
    pharmacy: {
      lat: 35.962338,
      lng: 126.715161,
      title: "4️⃣ 가까운 약국 (수송우리약국)",
      desc: "약국 · 비상약 및 상비약 구매 (도보 약 5~8분)",
      no: "4",
      markerClass: "facility-marker-teal",
      id: "pharmacy"
    }
  };

  // 2. Initialize Leaflet Map (Centered on coordinates midpoint)
  const centerLat = 35.9651;
  const centerLng = 126.7139;
  const map = L.map('leaflet-map', {
    scrollWheelZoom: false // Prevent map scroll from hijacking page scroll
  }).setView([centerLat, centerLng], 15);

  // Enable scroll zoom on map interaction
  map.on('click', () => {
    map.scrollWheelZoom.enable();
  });
  map.on('mouseout', () => {
    map.scrollWheelZoom.disable();
  });

  // 3. Add Premium CartoDB Voyager Tile Layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  const markers = {};

  // 4. Create markers and add to map
  Object.keys(positions).forEach(key => {
    const pos = positions[key];
    
    // Custom DIV icon matching the UI color scheme
    const customIcon = L.divIcon({
      html: `<div class="custom-map-marker ${pos.markerClass}">${pos.no}</div>`,
      className: 'custom-leaflet-icon-container',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    const marker = L.marker([pos.lat, pos.lng], { icon: customIcon }).addTo(map);
    
    const popupContent = `
      <div style="font-family: inherit; min-width: 180px;">
        <strong style="font-size: 13px; color: var(--ink); display: block; margin-bottom: 4px;">${pos.title}</strong>
        <span style="font-size: 11px; color: var(--muted); display: block; line-height: 1.3;">${pos.desc}</span>
      </div>
    `;
    marker.bindPopup(popupContent);

    if (pos.id) {
      markers[pos.id] = marker;

      // Event: Clicking marker highlights sidebar card
      marker.on('click', () => {
        // Clear previous active states
        document.querySelectorAll('.facility-card').forEach(el => el.classList.remove('is-active'));
        document.querySelectorAll('.custom-map-marker').forEach(el => el.classList.remove('is-active'));

        // Highlight matching card
        const card = document.querySelector(`.facility-card[data-facility-id="${pos.id}"]`);
        if (card) {
          card.classList.add('is-active');
          if (window.innerWidth <= 960) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }

        // Highlight this marker visually
        const markerDom = marker.getElement().querySelector('.custom-map-marker');
        if (markerDom) {
          markerDom.classList.add('is-active');
        }
      });
    }
  });

  // 5. Connect Sidebar Cards -> Map Markers
  const facilityCards = document.querySelectorAll('.facility-card');
  facilityCards.forEach(card => {
    card.addEventListener('click', () => {
      const facilityId = card.getAttribute('data-facility-id');
      if (!facilityId) return;

      // Clear previous active states
      facilityCards.forEach(el => el.classList.remove('is-active'));
      document.querySelectorAll('.custom-map-marker').forEach(el => el.classList.remove('is-active'));

      // Make clicked card active
      card.classList.add('is-active');

      // Animate map view to target marker and trigger popup
      const targetMarker = markers[facilityId];
      if (targetMarker) {
        targetMarker.openPopup();
        map.setView(targetMarker.getLatLng(), 16, { animate: true, duration: 0.6 });

        // Highlight marker element
        const markerDom = targetMarker.getElement().querySelector('.custom-map-marker');
        if (markerDom) {
          markerDom.classList.add('is-active');
        }
      }
    });
  });
}
