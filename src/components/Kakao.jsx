import React, { useEffect } from 'react'
const {kakao} = window;

export default function Kakao({listing}) {
    useEffect(()=>{
        const container = document.getElementById('map');
        const options = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(listing.geolocation.lat, listing.geolocation.lng), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };
        
        const map = new kakao.maps.Map(container, options);
        // 마커가 표시될 위치입니다 
        var markerPosition  = new kakao.maps.LatLng(listing.geolocation.lat, listing.geolocation.lng); 

        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });

        // 마커가 지도 위에 표시되도록 설정합니다
        marker.setMap(map);
    },[])
    
  return (
    <div id="map" style={{width:'100%', height:'100%'}}></div>
  )
}
