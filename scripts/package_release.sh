#!/bin/zsh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
RELEASE_DIR="$ROOT_DIR/release"
STAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="hulianwangyuamnwaihulizonghe_release_${STAMP}.tar.gz"
ARCHIVE_PATH="$RELEASE_DIR/$ARCHIVE_NAME"

mkdir -p "$RELEASE_DIR"

exclude_patterns=(
  ".git"
  ".svn"
  ".hg"
  ".DS_Store"
  ".idea"
  ".vscode"
  ".venv"
  "venv"
  "env"
  "target"
  "release"
  "node_modules"
  "backend/node_modules"
  "frontend/node_modules"
  "frontend/dist"
  "backend/uploads"
  "coverage"
  ".pytest_cache"
  "__pycache__"
  "*.py"
  "*.pyc"
  "*.pyo"
  "tests"
  "test"
  "__tests__"
  "e2e"
  "cypress"
  "playwright"
  "*.spec.js"
  "*.spec.jsx"
  "*.spec.ts"
  "*.spec.tsx"
  "*.test.js"
  "*.test.jsx"
  "*.test.ts"
  "*.test.tsx"
  "scripts/test*"
  "scripts/qa*"
  "scripts/e2e*"
  "scripts/playwright*"
  "scripts/cypress*"
  "scripts/pytest*"
)

tar_args=()
for pattern in "${exclude_patterns[@]}"; do
  tar_args+=(--exclude="$pattern")
done

cd "$ROOT_DIR"
tar -czf "$ARCHIVE_PATH" "${tar_args[@]}" \
  README.md \
  docker-compose.yml \
  .dockerignore \
  .gitignore \
  backend \
  frontend \
  deploy \
  scripts/package_release.sh

echo "打包完成: $ARCHIVE_PATH"
echo "说明: 打包过程未执行任何自动测试，且已排除依赖目录、Python/venv、target、git、测试与自动化测试文件。"
