# --- Created by Slick DDL
# To stop Slick DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table `games` (`gameid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gamename` VARCHAR(254) NOT NULL,`creator` INTEGER NOT NULL,`created` TIMESTAMP NOT NULL);
create table `players` (`playerid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gameid` INTEGER NOT NULL,`userid` INTEGER,`token` VARCHAR(254) NOT NULL,`score` INTEGER DEFAULT 0 NOT NULL);
create table `users` (`userid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`username` VARCHAR(254) NOT NULL,`email` VARCHAR(254) NOT NULL);
alter table `games` add constraint `game-creator` foreign key(`creator`) references `users`(`userid`) on update NO ACTION on delete NO ACTION;
alter table `players` add constraint `player-user` foreign key(`userid`) references `users`(`userid`) on update NO ACTION on delete NO ACTION;
alter table `players` add constraint `player-game` foreign key(`gameid`) references `games`(`gameid`) on update NO ACTION on delete NO ACTION;

# --- !Downs

ALTER TABLE games DROP FOREIGN KEY game-creator;
ALTER TABLE players DROP FOREIGN KEY player-user;
ALTER TABLE players DROP FOREIGN KEY player-game;
drop table `games`;
drop table `players`;
drop table `users`;

