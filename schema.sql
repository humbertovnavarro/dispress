CREATE TABLE IF NOT EXISTS SongPlay (
	url text,
	player text,
	guild text,
	date integer DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS SongPlayCount (
	url text PRIMARY KEY,
	count integer,
	guild text
);

CREATE TABLE IF NOT EXISTS SongLike (
	url text,
	player text,
	guild text
);

CREATE TABLE IF NOT EXISTS SongLikeCount (
	url text PRIMARY KEY,
	count integer,
	guild text
);

CREATE TABLE IF NOT EXISTS Playlist (
	id integer PRIMARY KEY AUTOINCREMENT,
	name text,
	description text
);

CREATE TABLE IF NOT EXISTS PlaylistSong (
	url text,
	playlist integer
);
