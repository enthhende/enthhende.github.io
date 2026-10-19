# 제3자 자료

## 글꼴

패치에는 학교안심 날개·마루 부리에서 변환한 폰트 데이터가 포함됩니다. 출처 표기는 원본 글꼴을 식별하기 위한 것이며 원저작자의 공식 지원이나 보증을 뜻하지 않습니다.

- 학교안심 날개: KERIS, Copyright (c) 2025 by KERIS. `licenses/LICENSE-NALGAE.txt`의 SIL OFL 1.1 적용.
- 마루 부리: NAVER, `licenses/LICENSE-MARUBURI.txt`의 저작권 표시·Reserved Font Name 및 SIL OFL 1.1 적용.

원본 게임의 ISO·추출 자산을 배포하지 않습니다. 차분 패치에는 한글화 과정에서 변경·추가한 데이터가 포함되므로 원본이 없다는 이유로 모든 데이터가 권리와 무관하다는 주장을 하지 않습니다.

## 적용 도구

브라우저 적용기는 RFC 3284의 기본 VCDIFF 코드표와 xdelta3의 Adler32 확장을 참조해 작성한 JavaScript 코드입니다. xdelta3 실행 파일이나 라이브러리를 동봉하지 않습니다.

선택 도구인 `apply_patch.py`는 Python 표준라이브러리로 파일을 검사하고 별도로 설치한 xdelta3를 실행합니다. 이 저장소와 배포 ZIP은 Python·xdelta3·Delta Patcher 실행 파일 또는 해당 라이브러리를 동봉하지 않습니다. 외부 도구는 각 공식 배포처의 라이선스를 따릅니다.

- xdelta3 공식 소스·배포: https://github.com/jmacd/xdelta
- Python 공식 배포: https://www.python.org/

번역·패치 데이터 전체를 제3자 폰트의 라이선스와 동일한 라이선스로 일괄 표시하지 않습니다. 공개 저장소의 별도 라이선스 지정이 없는 자체 문구·자료에 대해 포괄적인 재배포 허가를 추가 선언하지 않습니다.
