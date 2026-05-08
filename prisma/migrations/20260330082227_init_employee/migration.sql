-- CreateEnum
CREATE TYPE "EmployeeContractType" AS ENUM ('CLT', 'PJ', 'AUTONOMO', 'ESTAGIARIO', 'SOCIO');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "celularWhatsapp" TEXT NOT NULL,
    "emailPessoal" TEXT,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "cargoFuncao" TEXT NOT NULL,
    "tipoContrato" "EmployeeContractType" NOT NULL,
    "salarioBase" DECIMAL(10,2) NOT NULL,
    "percentualComissao" DECIMAL(5,2),
    "chavePix" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ATIVO',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_cpf_key" ON "Employee"("cpf");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
