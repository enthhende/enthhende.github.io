# 홈 게임 목록 관리

`index.html`의 게임 `article` 하나를 목록·카드 보기에서 함께 사용한다.
현재 공개된 네 게임은 단독 항목이며, 시리즈 정의는 비어 있다.
빈 코르다 항목이나 루비파티 메뉴는 생성하지 않는다.

## 단독 작품 추가

기존 `.gameCard`를 참고해 제목, 썸네일, 기종 배지, 제공 내용과 링크를 작성한다.
아래 속성은 검색·필터·집계에 사용한다.

```html
<article class="card gameCard" id="game-example"
  data-title="정식 작품명 검색용 별칭"
  data-platforms="psp switch">
  <!-- 기존 게임 항목과 같은 제목·이미지·기종·배포 상태·링크 -->
</article>
```

- ID는 중복되지 않는 `game-*`를 사용한다. 기존 주소·책갈피를 유지한다.
- 기종 코드는 `sfc`, `psp`, `ps1`, `switch`, `pc`. 여러 기종은 공백으로 구분한다.
  새 기종이 필요하면 홈의 기종 필터 버튼도 추가한다.
- 작품별 표시 기종과 배포 상태는 해당 작품 페이지 기준으로 작성한다.
- `data-published="false"`인 항목은 표시·검색·집계에서 제외한다.
  이 속성은 표시 상태이며, 공개 저장소에서 원고를 보호하는 수단은 아니다.

## 시리즈로 묶기

홈 하단 `catalogSeriesData`에 시리즈 정보를 넣고, 각 작품에 같은
`data-series` 값을 붙인다. 작품 정보는 다시 작성하거나 복제하지 않는다.

```json
{
  "example-series": {
    "title": "시리즈 이름",
    "aliases": ["검색 별칭"],
    "icon": "📚",
    "description": "선택 사항인 짧은 소개"
  }
}
```

```html
<article class="card gameCard" id="game-example"
  data-series="example-series"
  data-title="정식 작품명" data-platforms="psp">
  <!-- 해당 작품의 기존 정보 -->
</article>
```

- `image`에 사이트 루트 기준의 로컬 이미지 경로를 지정할 수 있다.
  이미지가 없으면 `icon` 또는 기본 책 아이콘을 사용한다.
- 첫 번째 작품 위치에 시리즈 묶음이 생긴다. 작품 순서는 HTML 순서를 따른다.
- 공개 작품이 없는 시리즈는 정의만 있어도 화면에 생성되지 않는다.
- 기본은 접힌 상태다. 목록에서는 묶음 행, 카드에서는 시리즈 카드로 표시한다.
- 작품명 또는 시리즈명·별칭으로 검색한다. 검색과 기종 조건을 모두 만족하는
  작품만 표시하고, 일치하는 작품이 있는 시리즈를 자동으로 펼친다.
- 검색·필터 해제 시 사용자가 선택한 접힘 상태로 돌아간다. 보기 전환은
  현재 접힘 상태와 검색 조건을 유지한다. 게임 수는 묶음 수가 아닌 작품 수다.
- 작품의 `#game-*` 책갈피로 이동하면 숨겨진 검색 조건과 부모 묶음을 풀어 준다.
- 루비파티 모음 페이지와 실제 미공개 작품 원고는 이 작업에 포함하지 않는다.

## 배포 전 확인

```sh
python3 scripts/check-home-catalog.py
node --check assets/js/home-catalog.js
python3 scripts/preview-home-catalog-series.py
```

마지막 명령은 시스템 임시 폴더 아래 미리보기 폴더를 출력한다. 폴더에는 실제 홈
복사본과 `series-preview.html`이 있고, 에셋은 원본을 참조한다. 미리보기 폴더만
로컬 HTTP 서버로 열어 단독·복수 시리즈·빈 시리즈·준비 작품을 검수한다.
임시 파일은 저장소나 배포본에 넣지 않는다.
