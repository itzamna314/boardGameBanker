package models

import play.api.db.slick.Config.driver.simple._

/**
 * Slick tables and associated classes
 * A game has many players, each of which represents an instance of a user within the
 * game.
 * Created by Kyl on 6/5/2014.
 */

object Models {
  case class Game(id:Option[Int],name:String)

  /*
   * Table to store games.  Each one only has a name, but is referenced by the
   * other tables.
   */
  class GameTable(tag: Tag) extends Table[Game](tag,"games") {

    def id = column[Int]("gameid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name", O.NotNull)

    def * = (id.?, name) <> (Game.tupled, Game.unapply)
  }

  val games = TableQuery[GameTable]

  case class User(id:Option[Int],name:String)

  /*
   * Table to store users.  Users may be used to persist logins in the future.  For
   * now, it just has a username.
   */
  class UserTable(tag: Tag) extends Table[User](tag,"users") {

    def id = column[Int]("userid", O.PrimaryKey, O.AutoInc)
    def username = column[String]("username", O.NotNull)

    def * = (id.?, username) <> (User.tupled, User.unapply)
  }

  val users = TableQuery[UserTable]

  case class Player(id:Option[Int],gameId:Int,userId:Int,name:String,token:String,
                    score:Int = 0)

  /*
   * Table to store players.  A player is a user in the context of a specific game.
   * This allows each user to participate in multiple games, and each game to have
   * multiple users.
   */
  class PlayerTable(tag: Tag) extends Table[Player](tag,"players") {

    def id = column[Int]("playerid", O.PrimaryKey, O.AutoInc)
    def gameId = column[Int]("gameid",O.NotNull)
    def userId = column[Int]("userid",O.NotNull)
    def name = column[String]("name", O.NotNull)
    def token = column[String]("token",O.NotNull)
    def score = column[Int]("score",O.Default(0))

    def * = (id.?,gameId,userId, name, token, score) <>
      (Player.tupled, Player.unapply)
  }

  val players = TableQuery[PlayerTable]
}