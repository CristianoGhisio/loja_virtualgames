-- Fase 5: Inserir permissões de crédito no sistema RBAC
-- Execute este script após o deploy (dentro do container postgres ou via prisma)

-- Inserir permissões na tabela Permission
INSERT INTO "Permission" ("id", "action", "resource", "description", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'view', 'credits', 'Visualizar créditos de clientes', NOW(), NOW()),
  (gen_random_uuid(), 'create', 'credits', 'Conceder crédito manual (ajuste)', NOW(), NOW()),
  (gen_random_uuid(), 'adjust', 'credits', 'Ajustar saldo de crédito (positivo ou negativo)', NOW(), NOW())
ON CONFLICT ("action", "resource") DO NOTHING;

-- Associar permissões ao perfil Admin (buscar roleId do admin)
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  r.id,
  p.id,
  NOW(),
  NOW()
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r.name = 'Admin'
  AND p.resource = 'credits'
  AND NOT EXISTS (
    SELECT 1 FROM "RolePermission" rp 
    WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
  );
