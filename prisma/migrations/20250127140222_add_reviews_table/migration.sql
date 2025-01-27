/*
  Warnings:

  - Added the required column `productId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop" TEXT NOT NULL
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "name", "rating") SELECT "comment", "createdAt", "id", "name", "rating" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_shop_idx" ON "Review"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
