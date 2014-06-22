package models

import play.api.db.slick.Config.driver.simple._
import play.api.Play.current
import scala.slick.jdbc.meta.MTable
import Models._

/**
 * Simple data access layer.
 * Reads key from config file to decide if we are testing or not.
 * Created by Kyl on 6/6/2014.
 */
object Dal {
  val myAppConfig = play.Play.application().configuration().getConfig("bgb")
  val isTest = myAppConfig.getBoolean("is-test",false)

  if ( isTest ) {
    resetTest()
  }

  def listGames() = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.games.list
    }
  }

  def findUser(query:String) = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.users.filter(u => u.username === query || u.email === query).firstOption
    }
  }

  def createUser(u:User) = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.users += u
    }
  }

  def createGame(g:Game) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      (Models.games returning Models.games.map(_.id)) += g
    }
  }

  def createPlayer(p:Player) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      (Models.players returning Models.players.map(_.id)) += p
    }
  }

  def resetTest() = {
    if (isTest) {
      // Populate the test database
      play.api.db.slick.DB.withSession { implicit session =>
        if ( !MTable.getTables("games").list().isEmpty ) {
          (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl).drop
        }

        (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl).create

        Models.games ++= Seq(
          Models.Game(Some(1),"Game of Thrones"),
          Models.Game(Some(2),"Smallworld")
        )

        Models.users ++= Seq(
          Models.User(Some(1),"Kim", "kim@gmail.com"),
          Models.User(Some(2),"Squish", "squish@gmail.com"),
          Models.User(Some(3),"Dao", "dao@gmail.com"),
          Models.User(Some(4),"Fish", "fish@gmail.com"),
          Models.User(Some(5),"Gene", "gene@gmail.com"),
          Models.User(Some(6),"Ryan", "ryan@gmail.com")
        )

        Models.players += Models.Player(Some(1),2,Some(1),"123456","Active")

        Models.players ++= Seq(
          Models.Player(Some(2),2,Some(2),"234567","Active"),
          Models.Player(Some(3),2,Some(3),"345678","Active"),
          Models.Player(Some(4),2,Some(4),"456789","Active"),
          Models.Player(Some(5),2,Some(5),"567890","Active"),
          Models.Player(Some(6),2,Some(6),"678901","Pending")
        )
      }
    }
  }
}
