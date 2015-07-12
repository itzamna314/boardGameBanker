# --- Created by Slick DDL
# To stop Slick DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table "config" ("configid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"name" VARCHAR NOT NULL);
create table "game-resource" ("gameresourceid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"gameid" INTEGER NOT NULL,"resourceid" INTEGER,"value" INTEGER DEFAULT 0 NOT NULL);
create table "games" ("gameid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"gamename" VARCHAR NOT NULL,"creator" INTEGER NOT NULL,"config" INTEGER NOT NULL,"created" TIMESTAMP NOT NULL);
create table "player-resource" ("playerresourceid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"playerid" INTEGER NOT NULL,"resourceid" INTEGER NOT NULL,"value" INTEGER DEFAULT 0 NOT NULL);
create table "players" ("playerid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"gameid" INTEGER NOT NULL,"userid" INTEGER,"token" VARCHAR NOT NULL,"color" VARCHAR,"name" VARCHAR,"icon" VARCHAR);
create table "resource" ("resourceid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"name" VARCHAR NOT NULL,"icon" VARCHAR,"color" VARCHAR,"configid" INTEGER NOT NULL,"resourcetype" VARCHAR DEFAULT 'player' NOT NULL,"visibility" VARCHAR DEFAULT 'visible' NOT NULL,"startvalue" INTEGER,"wincondition" VARCHAR,"conditionvalue" INTEGER);
create table "user-config" ("userconfigid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"userid" INTEGER NOT NULL,"configid" INTEGER NOT NULL);
create table "users" ("userid" INTEGER GENERATED BY DEFAULT AS IDENTITY(START WITH 1) NOT NULL PRIMARY KEY,"username" VARCHAR NOT NULL,"email" VARCHAR NOT NULL);
alter table "game-resource" add constraint "gameresource-game" foreign key("gameid") references "players"("playerid") on update NO ACTION on delete NO ACTION;
alter table "game-resource" add constraint "gameresource-resource" foreign key("resourceid") references "resource"("resourceid") on update NO ACTION on delete NO ACTION;
alter table "games" add constraint "game-config" foreign key("config") references "config"("configid") on update NO ACTION on delete NO ACTION;
alter table "games" add constraint "game-creator" foreign key("creator") references "users"("userid") on update NO ACTION on delete NO ACTION;
alter table "player-resource" add constraint "playerresource-resource" foreign key("resourceid") references "resource"("resourceid") on update NO ACTION on delete NO ACTION;
alter table "player-resource" add constraint "playerresource-player" foreign key("playerid") references "players"("playerid") on update NO ACTION on delete NO ACTION;
alter table "players" add constraint "player-game" foreign key("gameid") references "games"("gameid") on update NO ACTION on delete NO ACTION;
alter table "players" add constraint "player-user" foreign key("userid") references "users"("userid") on update NO ACTION on delete NO ACTION;
alter table "resource" add constraint "resource-config" foreign key("configid") references "config"("configid") on update NO ACTION on delete NO ACTION;
alter table "user-config" add constraint "userconfig-config" foreign key("configid") references "config"("configid") on update NO ACTION on delete NO ACTION;
alter table "user-config" add constraint "userconfig-user" foreign key("userid") references "users"("userid") on update NO ACTION on delete NO ACTION;

# --- !Downs

alter table "game-resource" drop constraint "gameresource-game";
alter table "game-resource" drop constraint "gameresource-resource";
alter table "games" drop constraint "game-config";
alter table "games" drop constraint "game-creator";
alter table "player-resource" drop constraint "playerresource-resource";
alter table "player-resource" drop constraint "playerresource-player";
alter table "players" drop constraint "player-game";
alter table "players" drop constraint "player-user";
alter table "resource" drop constraint "resource-config";
alter table "user-config" drop constraint "userconfig-config";
alter table "user-config" drop constraint "userconfig-user";
drop table "config";
drop table "game-resource";
drop table "games";
drop table "player-resource";
drop table "players";
drop table "resource";
drop table "user-config";
drop table "users";

