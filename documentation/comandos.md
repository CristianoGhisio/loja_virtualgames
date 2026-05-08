# 1. Subir containers com novas configs de segurança
docker compose down
docker compose up -d

# 2. Validar healthcheck
curl -f http://localhost:3000/api/health

# 3. Verificar hardening
docker inspect loja_app --format '{{.HostConfig.ReadonlyRootfs}}'  # deve retornar true
docker inspect loja_app --format '{{.HostConfig.SecurityOpt}}'      # deve conter no-new-privileges