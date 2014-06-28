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

  def listGames(userId:Int) = {
    play.api.db.slick.DB.withSession { implicit session =>
      val gamesQuery = for {
        p <- Models.players if p.userId === userId
        g <- Models.games if g.id === p.gameId
      } yield g
      gamesQuery.list
    }
  }

  def findUser(query:String) = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.users.filter(u => u.username === query || u.email === query).firstOption
    }
  }

  def getUser(id:Int) = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.users.filter(u => u.id === id).firstOption
    }
  }

  def createUser(u:User) = {
    play.api.db.slick.DB.withSession { implicit session =>
      (Models.users returning Models.users.map(_.id)) += u
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

  def bindPlayer(userId:Int,uuid:String) = {
    play.api.db.slick.DB.withSession { implicit session =>
      val q = for { p <- Models.players if p.token === uuid } yield p.userId
      q.update(Some(userId))

      q.firstOption
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

        Models.users ++= Seq(
          Models.User(Some(1),"Kim", "kim@gmail.com"),
          Models.User(Some(2),"Squish", "squish@gmail.com"),
          Models.User(Some(3),"Dao", "dao@gmail.com"),
          Models.User(Some(4),"Fish", "fish@gmail.com"),
          Models.User(Some(5),"Gene", "gene@gmail.com"),
          Models.User(Some(6),"Ryan", "ryan@gmail.com")
        )

        Models.games ++= Seq(
          Models.Game(Some(1),"Game of Thrones",1),
          Models.Game(Some(2),"Smallworld",6)
        )

        Models.players ++= Seq(
          Models.Player(Some(1),2,Some(1),"123456"),
          Models.Player(Some(2),2,Some(2),"234567"),
          Models.Player(Some(3),2,Some(3),"345678"),
          Models.Player(Some(4),2,Some(4),"456789"),
          Models.Player(Some(5),2,Some(5),"567890"),
          Models.Player(Some(6),2,Some(6),"678901"),
          Models.Player(Some(7),1,None,"1")
        )
      }
    }
  }
}
