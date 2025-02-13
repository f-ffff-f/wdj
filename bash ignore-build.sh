#!/bin/bash

CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

# README만 변경된 경우, 빌드 건너뛰기
if [[ "$CHANGED_FILES" =~ ^(README.md|README.en.md)$ ]]; then
  echo "Skipping build because only README.md was changed."
  exit 1
fi

# 변경된 파일이 README.md 이외에도 있으면 빌드 진행
exit 0