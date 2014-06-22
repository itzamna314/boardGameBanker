# --- Created by Slick DDL
# To stop Slick DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table `games` (`gameid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gamename` VARCHAR(254) NOT NULL);
create table `players` (`playerid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`gameid` INTEGER NOT NULL,`userid` INTEGER,`token` VARCHAR(254) NOT NULL,`status` VARCHAR(254) DEFAULT 'Pending' NOT NULL,`score` INTEGER DEFAULT 0 NOT NULL);
create table `users` (`userid` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,`username` VARCHAR(254) NOT NULL,`email` VARCHAR(254) NOT NULL);

# --- !Downs

drop table `games`;
drop table `players`;
drop table `users`;

