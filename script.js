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

  // Password Protection Logic
  const PAGE_PASSWORD = '1234'; // 변경 가능한 기본 비밀번호
  
  const passwordOverlay = document.getElementById('password-overlay');
  const appContent = document.getElementById('app-content');
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('page-password');
  const passwordError = document.getElementById('password-error');

  function revealPage() {
    if (passwordOverlay) {
      passwordOverlay.style.opacity = '0';
      passwordOverlay.style.visibility = 'hidden';
      // Wait for fadeout animation transition before hiding from layout
      setTimeout(() => {
        passwordOverlay.style.display = 'none';
      }, 400);
    }
    if (appContent) {
      appContent.style.display = 'block';
    }
    
    // Initialize Map only after revealing the content, to avoid Leaflet sizing bugs
    initGoogleLeafletMap();
  }

  // Check if session authentication exists
  if (sessionStorage.getItem('page_auth') === 'true') {
    revealPage();
  } else {
    if (appContent) appContent.style.display = 'none';
    if (passwordOverlay) passwordOverlay.style.display = 'flex';
  }

  // Handle password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (passwordInput && passwordInput.value === PAGE_PASSWORD) {
        sessionStorage.setItem('page_auth', 'true');
        revealPage();
      } else {
        if (passwordError) passwordError.style.display = 'block';
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
        
        // Shake animation effect on the card
        const card = document.querySelector('.password-card');
        if (card) {
          card.style.animation = 'none';
          card.offsetHeight; /* trigger reflow */
          card.style.animation = 'shake 0.4s ease';
        }
      }
    });
  }
});

function initGoogleLeafletMap() {
  const mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer) return;

  // 1. Precise real-world coordinates with descriptive emojis and premium Naver-like colors
  const positions = {
    lodging: {
      lat: 35.9629379,
      lng: 126.7126229,
      title: "🏠 군산수송제일오투그란데1단지 306동",
      desc: "단합대회 숙소 (도보 출발점)",
      no: "🏠",
      markerClass: "pin-color-pink",
      id: "lodging"
    },
    o2Mart: {
      lat: 35.9630521,
      lng: 126.7105447,
      title: "🛒 오투마트",
      desc: "마트 · 식료품 및 생필품 구매 (도보 약 3분)",
      no: "🛒",
      markerClass: "pin-color-orange",
      id: "o2-mart"
    },
    lotteMart: {
      lat: 35.9646700,
      lng: 126.7164061,
      title: "🛒 롯데마트 군산점",
      desc: "대형마트 · 식음료 대량 구매 (도보 약 9분)",
      no: "🛒",
      markerClass: "pin-color-yellow",
      id: "lotte-mart"
    },
    daiso: {
      lat: 35.9637636,
      lng: 126.7161674,
      title: "🛍️ 다이소 군산점",
      desc: "생활용품 · 소모품 및 행사 용품 (도보 약 7분)",
      no: "🛍️",
      markerClass: "pin-color-green",
      id: "daiso"
    },
    pharmacyRaon: {
      lat: 35.9636742,
      lng: 126.71513,
      title: "💊 라온약국",
      desc: "약국 · 상비약 및 처방조제 의약품 (도보 약 5분)",
      no: "💊",
      markerClass: "pin-color-red",
      id: "pharmacy-raon"
    },
    emart24: {
      lat: 35.9626886,
      lng: 126.7145384,
      title: "🏪 이마트24 R군산참조은점",
      desc: "편의점 · 24시간 간단한 간식 및 주류 (도보 약 4분)",
      no: "🏪",
      markerClass: "pin-color-brown",
      id: "emart24"
    },
    atm: {
      lat: 35.9642217,
      lng: 126.7105257,
      title: "🏧 신협ATM 군산팔마신협 수송지점",
      desc: "ATM · 현금 입출금 및 송금 서비스 (도보 약 5분)",
      no: "🏧",
      markerClass: "pin-color-blue",
      id: "atm"
    }
  };

  // 2. Initialize Leaflet Map (bounds will fit markers automatically)
  const map = L.map('leaflet-map', {
    scrollWheelZoom: false
  });

  // Remove "Leaflet" link prefix from the attribution control
  if (map.attributionControl) {
    map.attributionControl.setPrefix(false);
  }

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
    
    // Custom DIV icon matching the premium Naver Maps style pin shape
    const customIcon = L.divIcon({
      html: `
        <div class="custom-map-pin">
          <div class="pin-shadow"></div>
          <div class="pin-body ${pos.markerClass}"></div>
          <div class="pin-icon">${pos.no}</div>
        </div>
      `,
      className: 'custom-leaflet-icon-container',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -40]
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
        document.querySelectorAll('.custom-map-pin').forEach(el => el.classList.remove('is-active'));

        // Highlight matching card
        const card = document.querySelector(`.facility-card[data-facility-id="${pos.id}"]`);
        if (card) {
          card.classList.add('is-active');
          if (window.innerWidth <= 960) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }

        // Highlight this marker visually
        const markerDom = marker.getElement().querySelector('.custom-map-pin');
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
      document.querySelectorAll('.custom-map-pin').forEach(el => el.classList.remove('is-active'));

      // Make clicked card active
      card.classList.add('is-active');

      // Animate map view to target marker and trigger popup
      const targetMarker = markers[facilityId];
      if (targetMarker) {
        targetMarker.openPopup();
        map.setView(targetMarker.getLatLng(), 17, { animate: true, duration: 0.6 });

        // Highlight marker element
        const markerDom = targetMarker.getElement().querySelector('.custom-map-pin');
        if (markerDom) {
          markerDom.classList.add('is-active');
        }
      }
    });
  });
}
