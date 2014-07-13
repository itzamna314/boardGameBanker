# --- Created by Slick DDL
# To stop Slick DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table `config` (`configid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`name` VARCHAR(254) NOT NULL);
create table `games` (`gameid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gamename` VARCHAR(254) NOT NULL,`creator` INTEGER NOT NULL,`config` INTEGER,`created` TIMESTAMP NOT NULL,`turn` INTEGER DEFAULT 0 NOT NULL);
create table `player-resource` (`playerresourceid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`playerid` INTEGER NOT NULL,`resourceid` INTEGER,`value` INTEGER DEFAULT 0 NOT NULL);
create table `players` (`playerid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gameid` INTEGER NOT NULL,`userid` INTEGER,`token` VARCHAR(254) NOT NULL,`color` VARCHAR(254),`name` VARCHAR(254),`icon` VARCHAR(254));
create table `resource` (`resourceid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`name` VARCHAR(254) NOT NULL,`icon` VARCHAR(254),`color` VARCHAR(254),`configid` INTEGER NOT NULL,`visibility` VARCHAR(254) DEFAULT 'visible' NOT NULL,`startvalue` INTEGER,`wincondition` VARCHAR(254),`conditionvalue` INTEGER);
create table `user-config` (`userconfigid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`userid` INTEGER NOT NULL,`configid` INTEGER NOT NULL);
create table `users` (`userid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`username` VARCHAR(254) NOT NULL,`email` VARCHAR(254) NOT NULL);
alter table `games` add constraint `game-creator` foreign key(`creator`) references `users`(`userid`) on update NO ACTION on delete NO ACTION;
alter table `games` add constraint `game-config` foreign key(`config`) references `config`(`configid`) on update NO ACTION on delete NO ACTION;
alter table `player-resource` add constraint `playerresource-player` foreign key(`playerid`) references `players`(`playerid`) on update NO ACTION on delete NO ACTION;
alter table `player-resource` add constraint `playerresource-resource` foreign key(`resourceid`) references `resource`(`resourceid`) on update NO ACTION on delete NO ACTION;
alter table `players` add constraint `player-game` foreign key(`gameid`) references `games`(`gameid`) on update NO ACTION on delete NO ACTION;
alter table `players` add constraint `player-user` foreign key(`userid`) references `users`(`userid`) on update NO ACTION on delete NO ACTION;
alter table `resource` add constraint `resource-config` foreign key(`configid`) references `config`(`configid`) on update NO ACTION on delete NO ACTION;
alter table `user-config` add constraint `userconfig-config` foreign key(`configid`) references `config`(`configid`) on update NO ACTION on delete NO ACTION;
alter table `user-config` add constraint `userconfig-user` foreign key(`userid`) references `users`(`userid`) on update NO ACTION on delete NO ACTION;

# --- !Downs

ALTER TABLE games DROP FOREIGN KEY game-creator;
ALTER TABLE games DROP FOREIGN KEY game-config;
ALTER TABLE player-resource DROP FOREIGN KEY playerresource-player;
ALTER TABLE player-resource DROP FOREIGN KEY playerresource-resource;
ALTER TABLE players DROP FOREIGN KEY player-game;
ALTER TABLE players DROP FOREIGN KEY player-user;
ALTER TABLE resource DROP FOREIGN KEY resource-config;
ALTER TABLE user-config DROP FOREIGN KEY userconfig-config;
ALTER TABLE user-config DROP FOREIGN KEY userconfig-user;
drop table `config`;
drop table `games`;
drop table `player-resource`;
drop table `players`;
drop table `resource`;
drop table `user-config`;
drop table `users`;

