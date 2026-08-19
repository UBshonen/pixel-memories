import type { Wedding } from "@/types";

/**
 * 결혼식 정보.
 *
 * 지금은 전부 예시 내용이다. 실제 청첩장을 만들 때 이 파일만 바꾸면 된다.
 *
 * latitude / longitude 는 지금 당장은 길찾기 링크에만 쓰인다.
 * 나중에 지도 API를 붙이게 되면 그대로 재사용한다. (docs/BACKLOG.md 참고)
 */
export const WEDDING: Wedding = {
  groom: "정준호",
  bride: "김미나",

  date: "2027년 4월 17일 토요일",
  time: "오후 12시 30분",

  venue: "픽셀가든 웨딩홀",
  hall: "3층 그랜드홀",
  address: "서울특별시 중구 픽셀로 24",
  tel: "02-1234-5678",

  latitude: 37.5636,
  longitude: 126.9827,

  directions: [
    { label: "지하철", text: "2호선 을지로입구역 4번 출구에서 도보 5분" },
    { label: "버스", text: "간선 105, 152 / 지선 7011 — 픽셀로 정류장 하차" },
    { label: "주차", text: "건물 지하 1~3층, 2시간 무료" },
  ],
};

/** 카카오맵 길찾기 링크. API 키 없이 동작하며, 폰에서는 지도 앱이 열린다. */
export function kakaoDirectionsUrl(wedding: Wedding = WEDDING): string {
  const place = encodeURIComponent(wedding.venue);

  return `https://map.kakao.com/link/to/${place},${wedding.latitude},${wedding.longitude}`;
}

/** 네이버 지도 검색 링크. */
export function naverMapUrl(wedding: Wedding = WEDDING): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(wedding.venue)}`;
}
