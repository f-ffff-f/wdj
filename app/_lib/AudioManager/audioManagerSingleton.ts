import AudioManager from './AudioManager'

// 자바스크립트(ES Modules)에서는 어떤 모듈을 한 번 로드하면, 해당 모듈이 캐싱되어 애플리케이션 전체에서 동일한 인스턴스를 공유함
// 따라서 생성자가 실제로 호출되는 시점은 프로젝트 최초로 이 모듈이 임포트될 때 한 번
export const audioManager = new AudioManager()
