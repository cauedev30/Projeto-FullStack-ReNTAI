-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "specialty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Teleconsultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientName" TEXT NOT NULL,
    "patientBirthDate" DATETIME NOT NULL,
    "specialty" TEXT NOT NULL,
    "diagnosticHypothesis" TEXT NOT NULL,
    "clinicalHistory" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "supportDocumentName" TEXT NOT NULL,
    "supportDocumentPath" TEXT NOT NULL,
    "supportDocumentMime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "solicitantId" TEXT NOT NULL,
    "specialistId" TEXT,
    CONSTRAINT "Teleconsultation_solicitantId_fkey" FOREIGN KEY ("solicitantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Teleconsultation_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teleconsultationId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "provider" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentValidation_teleconsultationId_fkey" FOREIGN KEY ("teleconsultationId") REFERENCES "Teleconsultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teleconsultationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusHistory_teleconsultationId_fkey" FOREIGN KEY ("teleconsultationId") REFERENCES "Teleconsultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opinion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teleconsultationId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opinion_teleconsultationId_fkey" FOREIGN KEY ("teleconsultationId") REFERENCES "Teleconsultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Opinion_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentValidation_teleconsultationId_key" ON "DocumentValidation"("teleconsultationId");
