/*
  Warnings:

  - A unique constraint covering the columns `[orgname]` on the table `Org` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Org_orgname_key" ON "Org"("orgname");
