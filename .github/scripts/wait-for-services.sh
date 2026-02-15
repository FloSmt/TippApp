# File: .github/scripts/wait-for-services.sh
#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 container1 [container2 ...]"
  echo "You can set TIMEOUT (seconds) and INTERVAL (seconds) via env."
  exit 2
fi

containers=("$@")
timeout=${TIMEOUT:-180}
interval=${INTERVAL:-5}
elapsed=0

while [ "$elapsed" -lt "$timeout" ]; do
  all_healthy=true
  for c in "${containers[@]}"; do
    status=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$c" 2>/dev/null || echo missing)
    echo "[$(date +%T)] $c -> $status"
    if [ "$status" != "healthy" ]; then
      all_healthy=false
      break
    fi
  done

  if [ "$all_healthy" = true ]; then
    echo "All services healthy"
    exit 0
  fi

  sleep "$interval"
  elapsed=$((elapsed + interval))
done

echo "Timeout waiting for services to become healthy"
docker compose -f docker-compose.test.yaml ps || true
exit 1
