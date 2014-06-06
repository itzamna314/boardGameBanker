package models

import scala.slick.driver.MySQLDriver.simple._

/**
 * Slick tables and associated classes
 * A game has many players, each of which represents an instance of a user within the
 * game.
 * Created by Kyl on 6/5/2014.
 */

object Models {
  case class Game(id:Option[Int],name:String)
  /*
   * Slick projection
   */
  class GameTable(tag: Tag) extends Table[Game](tag,"games") {

    def id = column[Int]("gameid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name", O.NotNull)

    def * = (id.?, name) <> (Game.tupled, Game.unapply)
  }

  val games = TableQuery[GameTable]

  case class User(id:Option[Int],name:String)

  /*
   * Slick projection
   */
  class UserTable(tag: Tag) extends Table[User](tag,"users") {

    def id = column[Int]("userid", O.PrimaryKey, O.AutoInc)
    def username = column[String]("username", O.NotNull)

    def * = (id.?, username) <> (User.tupled, User.unapply)
  }

  case class Player(id:Option[Int],gameId:Int,userId:Int,name:String,score:Int = 0,
                    token:String)

  /*
   * Slick projection
   */
  class PlayerTable(tag: Tag) extends Table[Player](tag,"players") {

    def id = column[Int]("gameid", O.PrimaryKey, O.AutoInc)
    def gameId = column[Int]("gameid",O.NotNull)
    def userId = column[Int]("userid",O.NotNull)
    def name = column[String]("name", O.NotNull)
    def score = column[Int]("score",O.Default(0))
    def token = column[String]("token",O.NotNull)

    def * = (id.?,gameId,userId, name, score, token) <>
      (Player.tupled, Player.unapply)
  }
}