// TODO: Kakao Maps JavaScript API 키 입력 필요
// 서비스 배포 시 HTML 파일 하단의 카카오맵 script 태그 주석을 해제하고 실제 발급받은 App Key를 넣어주세요.
// 카카오 개발자 콘솔(https://developers.kakao.com)에서 도메인(예: https://yourdomain.github.io) 등록이 필요합니다.

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Offset for slightly better viewing position (optional)
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

  // Initialize Kakao Map if SDK is loaded
  initKakaoMap();
});

function initKakaoMap() {
  const mapContainer = document.getElementById('kakao-map');
  const fallbackContainer = document.getElementById('map-fallback');
  
  if (!mapContainer || !fallbackContainer) return;
  
  if (typeof kakao !== 'undefined' && kakao.maps) {
    fallbackContainer.style.display = 'none';
    mapContainer.style.display = 'block';
    
    // WGS84 좌표계 기준 '군산수송제일오투그란데1단지아파트 306동' 중심 좌표 설정 (35.967812, 126.711832)
    const lat = 35.967812;
    const lng = 126.711832;
    const centerLatLng = new kakao.maps.LatLng(lat, lng);
    
    const options = {
      center: centerLatLng,
      level: 3
    };
    
    const map = new kakao.maps.Map(mapContainer, options);
    
    // 주소-좌표 변환 객체를 생성합니다
    const geocoder = new kakao.maps.services.Geocoder();
    
    // 실제 도로명 주소로 좌표를 검색하여 설정
    const address = "전북특별자치도 군산시 수송안길 35"; // 군산수송제일오투그란데 1단지
    
    geocoder.addressSearch(address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        map.setCenter(coords);
        
        // 마커 생성
        const marker = new kakao.maps.Marker({
          map: map,
          position: coords
        });
        
        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
          content: '<div style="padding:8px 12px;font-size:12px;font-weight:700;color:#0f172a;text-align:center;min-width:180px;border-radius:8px;">🏠 숙소<br><span style="font-size:11px;font-weight:500;color:#64748b;display:inline-block;margin-top:2px;">수송제일오투그란데 306동</span></div>'
        });
        infowindow.open(map, marker);
        
        // 마커 클릭 이벤트 등록 (클릭 시 카카오맵 상세 보기 새창 열림)
        kakao.maps.event.addListener(marker, 'click', function() {
          window.open("https://map.kakao.com/?urlX=435165.0000030022&urlY=684921.9999999995&urlLevel=3&itemId=26707549&q=%EA%B5%B0%EC%82%B0%EC%88%98%EC%86%A1%EC%A0%9C%EC%9D%BC%EC%98%A4%ED%88%AC%EA%B7%B8%EB%9E%80%EB%8D%B01%EB%8B%A8%EC%A7%80%EC%95%84%ED%8C%8C%ED%8A%B8%20306%EB%8F%99&srcId=26707549&map_type=TYPE_MAP", "_blank", "noopener,noreferrer");
        });
      } else {
        // Geocoder 검색 실패 시 기본 WGS84 좌표 마커 표시
        createDefaultMarker(map, centerLatLng);
      }
    });
  } else {
    // SDK 로드되지 않은 상태면 fallback UI 유지
    console.log("Kakao Maps SDK not loaded. Showing fallback UI.");
  }
}

function createDefaultMarker(map, latLng) {
  const marker = new kakao.maps.Marker({
    map: map,
    position: latLng
  });
  
  const infowindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:8px 12px;font-size:12px;font-weight:700;color:#0f172a;text-align:center;min-width:180px;border-radius:8px;">🏠 숙소<br><span style="font-size:11px;font-weight:500;color:#64748b;display:inline-block;margin-top:2px;">수송제일오투그란데 306동</span></div>'
  });
  infowindow.open(map, marker);
  
  kakao.maps.event.addListener(marker, 'click', function() {
    window.open("https://map.kakao.com/?urlX=435165.0000030022&urlY=684921.9999999995&urlLevel=3&itemId=26707549&q=%EA%B5%B0%EC%82%B0%EC%88%98%EC%86%A1%EC%A0%9C%EC%9D%BC%EC%98%A4%ED%88%AC%EA%B7%B8%EB%9E%80%EB%8D%B01%EB%8B%A8%EC%A7%80%EC%95%84%ED%8C%8C%ED%8A%B8%20306%EB%8F%99&srcId=26707549&map_type=TYPE_MAP", "_blank", "noopener,noreferrer");
  });
}
