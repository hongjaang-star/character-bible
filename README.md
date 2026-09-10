# Character Bible Studio v1

## 목적
세계 각국의 동화/우화 기반 영상 제작을 위한 캐릭터 바이블 설계·프롬프트 생성 UI 프로토타입입니다.

## 포함 기능
- 우측 계층형 옵션 UI
- 국가 → 시대 자동 종속 옵션
- 캐릭터 유형 / 비주얼 스타일 / 형태 / Identity / 팔레트 / 의상 / 세부표현
- 표정 / 동작 / Character Lock
- 레퍼런스 이미지 업로드
- 레퍼런스 → 옵션값 변환 흐름의 프로토타입
- 자연어 수정 요청 프로토타입
- Character Bible Prompt 자동 생성
- Character Bible JSON 실시간 생성 및 다운로드
- 기능별 하단 사용 팁
- 전체 ‘가장 효율적인 사용법’ 가이드 모달

## 실행
`index.html`을 브라우저에서 열면 됩니다.

## 중요한 점
현재 버전의 ‘레퍼런스 분석’과 ‘AI 수정 요청’은 UI/동작 흐름을 검증하기 위한 로컬 프로토타입입니다.
실제 이미지 이해 AI 호출은 연결되어 있지 않습니다.

실서비스 연결 시 권장 구조:
1. Vision 모델에 레퍼런스 이미지 전달
2. 정해진 Character Bible JSON Schema로만 응답
3. 응답 JSON을 우측 옵션값으로 매핑
4. 사용자가 값 수정/잠금
5. Prompt Compiler가 영상툴용 프롬프트 생성
6. 캐릭터당 분석은 1회만 수행하고 Style Profile/Character DNA를 저장해 재사용

## 비용 효율 권장 표준
- Bible 생성 시: Front / 3-4 / Side / Back + 표정/동작 시트 보관
- 실제 영상툴 입력 시: 장면당 Reference 1~2장만 선택
- Reference 1: Identity
- Reference 2: 현재 각도/동작
- Text: 고정 Character DNA + Scene + Action + Camera
- 레퍼런스 분석은 캐릭터당 1회, 이후 JSON/Style Profile 재사용
