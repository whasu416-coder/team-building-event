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

  // Initialize Map with Google Maps tiles and correct coordinates
  initGoogleLeafletMap();
});

function initGoogleLeafletMap() {
  const mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer) return;

  // 1. Precise real-world coordinates matching Google My Maps layer screenshot
  const positions = {
    lodging: {
      lat: 35.961021,
      lng: 126.711833,
      title: "🏠 군산수송제일오투그란데1단지 306동",
      desc: "단합대회 숙소 (도보 출발점)",
      no: "🏠",
      markerClass: "lodging-marker",
      id: "lodging"
    },
    o2Mart: {
      lat: 35.961000,
      lng: 126.710700,
      title: "1️⃣ 오투마트",
      desc: "마트 · 식료품 및 생필품 구매 (도보 1분 이내)",
      no: "1",
      markerClass: "facility-marker-orange",
      id: "o2-mart"
    },
    lotteMart: {
      lat: 35.964724,
      lng: 126.716392,
      title: "2️⃣ 롯데마트 군산점",
      desc: "대형마트 · 식음료 대량 구매 (도보 약 8~10분)",
      no: "2",
      markerClass: "facility-marker-yellow",
      id: "lotte-mart"
    },
    daiso: {
      lat: 35.962649,
      lng: 126.715225,
      title: "3️⃣ 다이소 군산점",
      desc: "생활용품 · 소모품 및 행사 용품 (도보 약 5~7분)",
      no: "3",
      markerClass: "facility-marker-green",
      id: "daiso"
    },
    pharmacy: {
      lat: 35.962338,
      lng: 126.715161,
      title: "4️⃣ 수송우리약국",
      desc: "약국 · 비상약 및 상비약 구매 (도보 약 5~7분)",
      no: "4",
      markerClass: "facility-marker-green",
      id: "pharmacy"
    },
    emart24: {
      lat: 35.955562,
      lng: 126.713296,
      title: "5️⃣ 이마트24 R군산참조은점",
      desc: "편의점 · 24시간 간단한 간식 및 주류 (도보 약 6~8분)",
      no: "5",
      markerClass: "facility-marker-brown",
      id: "emart24"
    },
    atm: {
      lat: 35.955487,
      lng: 126.711833,
      title: "6️⃣ 신협ATM 군산월명신협 수송지점",
      desc: "ATM · 현금 입출금 및 송금 서비스 (도보 약 6~8분)",
      no: "6",
      markerClass: "facility-marker-magenta",
      id: "atm"
    }
  };

  // 2. Initialize Leaflet Map (bounds will fit markers automatically)
  const map = L.map('leaflet-map', {
    scrollWheelZoom: false
  });

  // Enable scroll zoom on map interaction
  map.on('click', () => {
    map.scrollWheelZoom.enable();
  });
  map.on('mouseout', () => {
    map.scrollWheelZoom.disable();
  });

  // 3. Add Real Google Maps Tile Layer (Roadmap style, no API key needed)
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank">Google Maps</a>'
  }).addTo(map);

  const markers = {};
  const markerPoints = [];

  // 4. Create markers and add to map
  Object.keys(positions).forEach(key => {
    const pos = positions[key];
    markerPoints.push([pos.lat, pos.lng]);
    
    // Custom DIV icon matching the Google My Maps screenshot pin colors
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

  // 5. Fit map bounds to show all markers nicely
  map.fitBounds(markerPoints, { padding: [50, 50] });

  // 6. Connect Sidebar Cards -> Map Markers
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
        map.setView(targetMarker.getLatLng(), 17, { animate: true, duration: 0.6 });

        // Highlight marker element
        const markerDom = targetMarker.getElement().querySelector('.custom-map-marker');
        if (markerDom) {
          markerDom.classList.add('is-active');
        }
      }
    });
  });
}
