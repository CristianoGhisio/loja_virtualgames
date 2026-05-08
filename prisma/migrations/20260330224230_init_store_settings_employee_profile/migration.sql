-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "descricaoPerfil" TEXT,
ADD COLUMN     "fotoUrl" TEXT;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "nameFantasia" TEXT NOT NULL DEFAULT 'Virtual Games',
    "cnpj" TEXT NOT NULL DEFAULT '00.000.000/0001-00',
    "address" TEXT NOT NULL DEFAULT 'Rua Venâncio Aires, 1434, Torre Divindade. Sala 106 D-2, Centro, Santa Maria, RS - CEP 97010-002',
    "phone" TEXT NOT NULL DEFAULT '(55) 99725-2786',
    "email" TEXT NOT NULL DEFAULT 'contato@virtualgames.com',
    "serviceHours" TEXT NOT NULL DEFAULT 'Segunda a Sexta: 09:00 às 18:30 | Sábado: 09:00 às 13:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
