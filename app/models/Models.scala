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

  case class Player(id:Option[Int],gameId:Int,userId:Option[Int],token:String,
                    color:Option[String] = None,name:Option[String] = None,iconClass:Option[String] = None)

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
    def color = column[String]("color",O.Nullable)
    def name = column[String]("name",O.Nullable)
    def icon = column[String]("icon",O.Nullable)

    def gameFk = foreignKey("player-game",gameId,games)(_.id)
    def userFk = foreignKey("player-user",userId,users)(_.id)

    def * = (id.?,gameId,userId,token,color.?,name.?,icon.?) <>
      (Player.tupled, Player.unapply)
  }

  val players = TableQuery[PlayerTable]

  case class PlayerResource(id:Option[Int],playerId:Int,resourceId:Option[Int] = None,value:Int = 0)

  /*
   * Table to store player's resources.  This is where all scoring will be tracked.
   */
  class PlayerResourceTable(tag: Tag) extends Table[PlayerResource](tag,"player-resource"){
    def id = column[Int]("playerresourceid",O.PrimaryKey, O.AutoInc)
    def playerId = column[Int]("playerid",O.NotNull)
    def resourceId = column[Int]("resourceid",O.Nullable)
    def value = column[Int]("value",O.Default(0))

    def playerFk = foreignKey("playerresource-player",playerId,players)(_.id)
    def resourceFk = foreignKey("playerresource-resource",resourceId,resources)(_.id)

    def * = (id.?,playerId,resourceId.?,value) <> (PlayerResource.tupled,PlayerResource.unapply)
  }

  val playerResources = TableQuery[PlayerResourceTable]

  case class GlobalResource(id:Option[Int],gameId:Int,resourceId:Option[Int] = None,value:Int = 0)

  /*
   * Table to store global resources.  This is where turns will be tracked.
   */
  class GlobalResourceTable(tag: Tag) extends Table[GlobalResource](tag,"game-resource"){
    def id = column[Int]("gameresourceid",O.PrimaryKey, O.AutoInc)
    def gameId = column[Int]("gameid",O.NotNull)
    def resourceId = column[Int]("resourceid",O.Nullable)
    def value = column[Int]("value",O.Default(0))

    def playerFk = foreignKey("gameresource-game",gameId,players)(_.id)
    def resourceFk = foreignKey("gameresource-resource",resourceId,resources)(_.id)

    def * = (id.?,gameId,resourceId.?,value) <> (GlobalResource.tupled,GlobalResource.unapply)
  }

  val globalResources = TableQuery[GlobalResourceTable]

  case class Game(id:Option[Int],name:String,creatorId:Int,configId:Option[Int] = None,
                  created:Timestamp = new java.sql.Timestamp(Calendar.getInstance().getTime.getTime), turn:Int = 0)

  /*
   * Table to store games.
   */
  class GameTable(tag: Tag) extends Table[Game](tag,"games") {

    def id = column[Int]("gameid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("gamename", O.NotNull)
    def creator = column[Int]("creator",O.NotNull)
    def createdDate = column[Timestamp]("created",O.NotNull)
    def configId = column[Int]("config",O.Nullable)
    def turn = column[Int]("turn",O.Default(0))

    def creatorFk = foreignKey("game-creator",creator,users)(_.id)
    def configFk = foreignKey("game-config",configId,configs)(_.id)

    def * = (id.?, name, creator, configId.?, createdDate, turn) <> (Game.tupled, Game.unapply)
  }

  val games = TableQuery[GameTable]

  case class Config(id:Option[Int],name:String)

  class ConfigTable(tag: Tag) extends Table[Config](tag,"config") {
    def id = column[Int]("configid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name",O.NotNull)

    def * = (id.?, name) <> (Config.tupled, Config.unapply)
  }

  val configs = TableQuery[ConfigTable]

  case class Resource(id:Option[Int],name:String,iconClass:Option[String],color:Option[String],configId:Int,
                      visibility:String,startValue:Option[Int],winCondition:Option[String],conditionValue:Option[Int])

  /*
   * Table that identifies the settings for a single resource.
   * Each player will have a score for each resource defined in the game's config.
   */
  class ResourceTable(tag: Tag) extends Table[Resource](tag,"resource") {
    def id = column[Int]("resourceid", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name", O.NotNull)
    def iconClass = column[String]("icon",O.Nullable)
    def color = column[String]("color",O.Nullable)
    def configId = column[Int]("configid",O.NotNull)
    def visibility = column[String]("visibility",O.Default("visible"))
    def startValue = column[Int]("startvalue",O.Nullable)
    def winCondition = column[String]("wincondition",O.Nullable)
    def conditionValue = column[Int]("conditionvalue",O.Nullable)

    def configFk = foreignKey("resource-config",configId,configs)(_.id)

    def * = (id.?,name,iconClass.?,color.?,configId,visibility,startValue.?,winCondition.?,conditionValue.?) <>
            (Resource.tupled, Resource.unapply)
  }

  val resources = TableQuery[ResourceTable]

  case class UserConfig(id:Option[Int],userId:Int,configId:Int)

  class UserConfigTable(tag: Tag) extends Table[UserConfig](tag,"user-config") {
    def id = column[Int]("userconfigid", O.PrimaryKey, O.AutoInc)
    def userId = column[Int]("userid", O.NotNull)
    def configId = column[Int]("configid", O.NotNull)
    def userFk  = foreignKey("userconfig-user",userId,users)(_.id)
    def configFk = foreignKey("userconfig-config",configId,configs)(_.id)

    def * = (id.?,userId,configId) <> (UserConfig.tupled, UserConfig.unapply)
  }

  val userConfigs = TableQuery[UserConfigTable]

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