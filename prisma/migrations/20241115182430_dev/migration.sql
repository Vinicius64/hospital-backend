-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "CPF" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "dataNascimento" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'paciente'
);

-- CreateTable
CREATE TABLE "Medico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "CRI" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "dataNascimento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'medico'
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "idMedico" TEXT NOT NULL,
    "idPaciente" TEXT NOT NULL,
    "dataHorario" TEXT NOT NULL,
    CONSTRAINT "Consulta_idMedico_fkey" FOREIGN KEY ("idMedico") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consulta_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exame" (
    "id" TEXT NOT NULL,
    "idMedico" TEXT NOT NULL,
    "idPaciente" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "dataHorario" TEXT NOT NULL,
    "nomeExame" TEXT NOT NULL,
    CONSTRAINT "Exame_idMedico_fkey" FOREIGN KEY ("idMedico") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exame_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'administrador'
);

-- CreateTable
CREATE TABLE "loglogin" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataHorario" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Endereco_paciente" (
    "id" TEXT NOT NULL,
    "idPaciente" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "Endereco_paciente_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Endereco_medico" (
    "id" TEXT NOT NULL,
    "idMedico" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "Endereco_medico_idMedico_fkey" FOREIGN KEY ("idMedico") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Imagem_paciente" (
    "id" TEXT NOT NULL,
    "idPaciente" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Imagem_paciente_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Imagem_medico" (
    "id" TEXT NOT NULL,
    "idMedico" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Imagem_medico_idMedico_fkey" FOREIGN KEY ("idMedico") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_id_key" ON "Paciente"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_CPF_key" ON "Paciente"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_email_key" ON "Paciente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Medico_id_key" ON "Medico"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Medico_CRI_key" ON "Medico"("CRI");

-- CreateIndex
CREATE UNIQUE INDEX "Medico_email_key" ON "Medico"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Consulta_id_key" ON "Consulta"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exame_id_key" ON "Exame"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_id_key" ON "Administrador"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loglogin_id_key" ON "loglogin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_paciente_id_key" ON "Endereco_paciente"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_paciente_idPaciente_key" ON "Endereco_paciente"("idPaciente");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_medico_id_key" ON "Endereco_medico"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_medico_idMedico_key" ON "Endereco_medico"("idMedico");

-- CreateIndex
CREATE UNIQUE INDEX "Imagem_paciente_id_key" ON "Imagem_paciente"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Imagem_paciente_idPaciente_key" ON "Imagem_paciente"("idPaciente");

-- CreateIndex
CREATE UNIQUE INDEX "Imagem_medico_id_key" ON "Imagem_medico"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Imagem_medico_idMedico_key" ON "Imagem_medico"("idMedico");
