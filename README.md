# DJ Mixing Web Application [Alpha]
test
[English](README.en.md) | 한국어

DJ 웹 애플리케이션입니다

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## 시작하기

1. Enter를 누르거나 파일 선택을 클릭하여 오디오 파일을 업로드합니다
2. 왼쪽,오른쪽 화살표를 누르거나 아이템의 양쪽 끝 버튼을 눌러서 덱에 오디오 파일을 로드합니다
3. 스텝 1으로 돌아갑니다
4. 스텝 2로 돌아가서 다른쪽 덱에 오디오 파일을 로드합니다

## 개발 환경 시작하기

필수 요구 사항
- **Docker**와 **Docker Compose**가 설치되어 있어야 합니다

기본 명령어
```sh
# 컨테이너를 백그라운드로 실행
docker-compose up -d

# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 중지 및 삭제
docker-compose down

# 기존 컨테이너 시작
docker-compose start
```


## 프로토타입 개발 현황

- [x] DJ 앱 코어
- [x] 백엔드
  - [x] 고도화
- [x] 리팩토링
- [x] 반응형 UI
- [ ] 회원가입
- [ ] seo 적용
- [ ] 테스트 커버리지 100% 달성
- [ ] 미디 컨트롤

## 기술 스택

-   [Next.js 14](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Web Audio API](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API)
-   [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
-   [Valtio](https://github.com/pmndrs/valtio)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Prisma](https://www.prisma.io)
-   [PostgreSQL](https://www.postgresql.org)
-   [Playwright](https://playwright.dev)

## 라이선스

GPL (GNU General Public License) - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 크레딧

이 프로젝트는 [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)을 기반으로 제작되었습니다
