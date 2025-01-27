/*
  Warnings:

  - You are about to drop the column `productId` on the `Review` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop" TEXT NOT NULL
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "name", "rating", "shop") SELECT "comment", "createdAt", "id", "name", "rating", "shop" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_shop_idx" ON "Review"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
