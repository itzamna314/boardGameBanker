package models

import play.api.db.slick.Config.driver.simple._
import play.api.Play.current
import scala.slick.jdbc.meta.MTable

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

  println("Loading DAL")
  println("db: " + play.Play.application().configuration().getString("db.default.url"))

  def listGames() = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.games.list
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
          Models.User(Some(1),"Kim"),
          Models.User(Some(2),"Squish"),
          Models.User(Some(3),"Dao"),
          Models.User(Some(4),"Fish"),
          Models.User(Some(5),"Gene"),
          Models.User(Some(6),"Ryan")
        )

        Models.players += Models.Player(Some(1),2,1,"QuimmFTW","123456")

        Models.players ++= Seq(
          Models.Player(Some(2),2,2,"Squishyishie","234567"),
          Models.Player(Some(3),2,3,"Yuuzhan","345678"),
          Models.Player(Some(4),2,4,"FishOfThrones","456789"),
          Models.Player(Some(5),2,5,"GeneWithEnvy","567890"),
          Models.Player(Some(6),2,6,"Adaptyv","678901")
        )
      }
    }
  }
}
