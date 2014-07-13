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

  def listGames(userId:Int) : List[Game] = {
    play.api.db.slick.DB.withSession { implicit session =>
      val gamesQuery = for {
        p <- Models.players if p.userId === userId
        g <- Models.games if g.id === p.gameId
      } yield g
      val games: List[Game] = gamesQuery.list
      val s : Set[Game] = games.foldRight(Set[Game]())({ (g:Game,s:Set[Game]) =>
        if ( !s.contains(g) )
          s + g
        else
          s
      })

      s.foldLeft[List[Game]](List[Game]()){ (l:List[Game],g:Game) =>
        g :: l
      }
    }
  }

  case class resourceState(id:Option[Int],value:Int)
  case class playerState(id:Int,userId:Int,playerName:Option[String],userName:String,email:String,
                         resources:List[resourceState])
  case class gameState(id:Int,name:String,creatorId:Int,created:String,players:List[playerState])

  def getGame(gameId:Int) : gameState = {
    play.api.db.slick.DB.withSession { implicit session =>
      val gameQuery = for {
        p <- Models.players if p.gameId === gameId
        g <- Models.games if g.id === p.gameId
        u <- Models.users if u.id === p.userId
        pr <- Models.playerResources if pr.playerId === p.id
      } yield (g,p,u,pr)
      val queryResult = gameQuery.list

      val playerGroups = queryResult groupBy { rawQuery => rawQuery._2.id }

      val resourceStates = playerGroups map { groupedQuery =>
        groupedQuery._1.get -> (groupedQuery._2 map { rawQuery  =>
          resourceState(rawQuery._4.resourceId,rawQuery._4.value)
        })
      }

      val playerStates = playerGroups map { groupedQuery =>
        val firstRow = groupedQuery._2(0)
        val user = firstRow._3
        val player = firstRow._2

        playerState(player.id.get,user.id.get,player.name,user.name,user.email,resourceStates(player.id.get))
      }

      val game = queryResult(0)._1
      gameState(game.id.get,game.name,game.creatorId,game.created.toString,playerStates.toList)
    }
  }

  def addPoints(gameId:Int,userId:Int,qty:Int,resourceId:Option[Int] = None) = {
    play.api.db.slick.DB.withSession{ implicit session =>
      val resourceQuery = resourceId match {
        case Some(resId) =>
          for {
            p <- Models.players if p.gameId === gameId && p.userId === userId
            pr <- Models.playerResources if pr.playerId === p.id && pr.resourceId === resId
          } yield pr
        case None =>
          for {
            p <- Models.players if p.gameId === gameId && p.userId === userId
            pr <- Models.playerResources if pr.playerId === p.id
          } yield pr
      }

      Query(resourceQuery.length).first match {
        case 1 =>
          val playerResourceId = resourceQuery.first().id
          val updateQuery = for {
            pr <- Models.playerResources if pr.id === playerResourceId
          } yield pr.value

          val curScore = updateQuery.first()
          val retVal = updateQuery.update(curScore + qty)
          retVal > 0

        case _ =>
          false
      }
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

  // Create the player, as well as all applicable resources
  def createPlayer(p:Player) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      val playerId = (Models.players returning Models.players.map(_.id)) += p

      val game = Models.games.filter(_.id === p.gameId).first()

      game.configId match {
        case None =>
          val resource = Models.PlayerResource(None,playerId,None)
          Models.playerResources += resource
        case Some(cId) =>
          val resources = Models.resources.filter(_.configId === cId).list
          resources foreach { res =>
            Models.playerResources += Models.PlayerResource(None,playerId,res.id)
          }
      }

      playerId
    }
  }

  def bindPlayer(userId:Int,uuid:String) : String = {
    play.api.db.slick.DB.withSession { implicit session =>

      val q = for { p <- Models.players if p.token === uuid } yield p
      val player = q.firstOption
      player match {
        case None =>
          "UUIDInvalid"
        case Some(p:Player) =>
          val existingPlayer = Models.players.filter(_.gameId === p.gameId ).filter(_.userId === userId)
          existingPlayer.firstOption.isDefined match {
            case false =>
              val updateQuery = for {p <- Models.players if p.token === uuid } yield p.userId
              updateQuery.update(Some(userId))
              ""
            case true =>
              "PlayerExisted"
          }
      }
    }
  }

  def deleteGame(gameId:Int,userId:Int) = {
    play.api.db.slick.DB.withSession { implicit session =>
      val toDelete = for {
        p <- Models.players if p.gameId === gameId && p.userId === userId
        g <- Models.games if g.id === p.gameId && g.creator === userId
      } yield p

      val canDelete = toDelete.firstOption.isDefined

      if ( canDelete ) {
        Models.playerResources.filter(pr => pr.playerId in
          Models.players.filter(_.gameId === gameId).map(_.id)
        ).delete
        Models.players.filter(_.gameId === gameId).delete
        Models.games.filter(_.id === gameId).delete
      }

      canDelete
    }
  }

  def resetTest() = {
    if (isTest) {
      // Populate the test database
      play.api.db.slick.DB.withSession { implicit session =>
        if ( !MTable.getTables("games").list().isEmpty ) {
          (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl).drop
        }

        (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl ++ Models.configs.ddl ++ Models.resources.ddl
          ++ Models.playerResources.ddl ++ Models.userConfigs.ddl).create

        Models.users ++= Seq(
          Models.User(Some(1),"Kim", "kim@gmail.com"),
          Models.User(Some(2),"Squish", "squish@gmail.com"),
          Models.User(Some(3),"Dao", "dao@gmail.com"),
          Models.User(Some(4),"Fish", "fish@gmail.com"),
          Models.User(Some(5),"Gene", "gene@gmail.com"),
          Models.User(Some(6),"Ryan", "ryan@gmail.com")
        )

        Models.games ++= Seq(
          Models.Game(Some(1),"Game of Thrones",3),
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

        Models.configs ++= Seq(
          Models.Config(Some(1),"Default")
        )

        Models.resources ++= Seq(
          Models.Resource(Some(1),"Sheep",None,None,1,"visible",None,None,None)
        )

        Models.playerResources ++= Seq(
          Models.PlayerResource(Some(1),1,Some(1)),
          Models.PlayerResource(Some(2),2,Some(1)),
          Models.PlayerResource(Some(3),3,Some(1)),
          Models.PlayerResource(Some(4),4,Some(1)),
          Models.PlayerResource(Some(5),5,Some(1)),
          Models.PlayerResource(Some(6),6,Some(1))
        )
      }
    }
  }
}
