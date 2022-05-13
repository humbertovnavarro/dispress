-- CreateTable
CREATE TABLE "Songs" (
    "song" TEXT NOT NULL,
    "title" TEXT,
    "genre" TEXT,
    "year" INTEGER,
    "duration" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plays" INTEGER NOT NULL DEFAULT 1,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "guild" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" TEXT NOT NULL,
    "song" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guild" TEXT NOT NULL,
    "dislike" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Plays" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guild" TEXT NOT NULL,
    "song" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Playlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playlistName" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "song" TEXT NOT NULL,
    "user" TEXT NOT NULL
);
