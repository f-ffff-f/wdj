#!/bin/bash
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

# README.md 또는 README.en.md만 변경되었는지 확인
if [[ "$CHANGED_FILES" =~ ^(README.md|README.en.md)$ ]]; then
  echo "Skipping build because only README files were changed."
  exit 0  # 빌드 스킵을 위해 0 반환 후 종료
fi

# 다른 파일이 변경되었으면 빌드 실행
exec "$@"