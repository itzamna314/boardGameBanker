package models

import java.sql.Timestamp
import java.util.Calendar
import play.api.db.slick.Config.driver.simple._

/**
 * Slick tables and associated classes
 * A game has many players, each of which represents an instance of a user within the
 * game.
 * Must put tables in dependency orders, such that tables with a foreign key dependency on another table are listed
 * before the table that they depend on.  This ensures that play evolutions will work correctly.
 * Created by Kyl on 6/5/2014.
 */

object Models {

  case class Player(id:Option[Int],gameId:Int,userId:Option[Int],
                    token:String,score:Int = 0)

  /*
   * Table to store players.  A player is a user in the context of a specific game.
   * This allows each user to participate in multiple games, and each game to have
   * multiple users.
   */
  class PlayerTable(tag: Tag) extends Table[Player](tag,"players") {

    def id = column[Int]("playerid", O.PrimaryKey, O.AutoInc)
    def gameId = column[Int]("gameid",O.NotNull)
    def userId = column[Option[Int]]("userid",O.Nullable)
    def token = column[String]("token",O.NotNull)
    def score = column[Int]("score",O.Default(0))

    def gameFk = foreignKey("player-game",gameId,games)(_.id)
    def userFk = foreignKey("player-user",userId,users)(_.id)

    def * = (id.?,gameId,userId,token,score) <>
      (Player.tupled, Player.unapply)
  }

  val players = TableQuery[PlayerTable]

  case class Game(id:Option[Int],name:String,creatorId:Int,created:Timestamp =
                   new java.sql.Timestamp(Calendar.getInstance().getTime.getTime))

  /*
   * Table to store games.  Each one only has a name, but is referenced by the
   * other tables.
   */
  class GameTable(tag: Tag) extends Table[Game](tag,"games") {

    def id = column[Int]("gameid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("gamename", O.NotNull)
    def creator = column[Int]("creator",O.NotNull)
    def createdDate = column[Timestamp]("created",O.NotNull)

    def creatorFk = foreignKey("game-creator",creator,users)(_.id)

    def * = (id.?, name, creator, createdDate) <> (Game.tupled, Game.unapply)
  }

  val games = TableQuery[GameTable]

  case class User(id:Option[Int],name:String,email:String)

  /*
   * Table to store users.  Users may be used to persist logins in the future.  For
   * now, it just has a username.
   */
  class UserTable(tag: Tag) extends Table[User](tag,"users") {

    def id = column[Int]("userid", O.PrimaryKey, O.AutoInc)
    def username = column[String]("username", O.NotNull)
    def email = column[String]("email",O.NotNull)

    def * = (id.?, username, email) <> (User.tupled, User.unapply)
  }

  val users = TableQuery[UserTable]
}