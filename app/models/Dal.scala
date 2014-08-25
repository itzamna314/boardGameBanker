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
      } yield (g,p)
      val queryList = gamesQuery.list
      val games: List[Game] = queryList map {res => res._1}
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

  case class resourceState(id:Int,value:Int)
  case class resourceDefinition(id:Int, name:String, resType:String,
                                  color:Option[String] = None, icon: Option[String] = None)

  // TODO: Separate states from definitions
  // state contains only resource states and player id.
  // definition contains everything else
  // same goes for global states
  // This will avoid sending game definition data for each update, improving performance
  case class playerState(id:Int,userId:Int,playerName:Option[String],userName:String,email:String,
                         resources:List[resourceState],color:Option[String] = None,icon:Option[String] = None)
  case class gameState(id:Int,name:String,creatorId:Int,created:String,resources:List[resourceDefinition],
                       players:List[playerState], globals:List[resourceState])

  def getGame(gameId:Int) : gameState = {
    play.api.db.slick.DB.withSession { implicit session =>
      val playersQuery = for {
        g <- Models.games if g.id === gameId
        p <- Models.players if p.gameId === g.id
        u <- Models.users if u.id === p.userId
        pr <- Models.playerResources if pr.playerId === p.id
      } yield (g,p,u,pr)
      val queryResult = playersQuery.list

      val playerGroups = queryResult groupBy { rawQuery => rawQuery._2.id }

      val playerResourceStates = playerGroups map { groupedQuery =>
        groupedQuery._1.get -> (groupedQuery._2 groupBy { raw => raw._4.resourceId } map {rawQuery =>
          val resState = rawQuery._2.take(1).toList(0)
          resourceState(resState._4.resourceId, resState._4.value)
        })
      }

      val playerStates = playerGroups map { groupedQuery =>
        val firstRow = groupedQuery._2(0)
        val user = firstRow._3
        val player = firstRow._2

        playerState(player.id.get,user.id.get,player.name,user.name,user.email,
          playerResourceStates(player.id.get).toList, player.color,player.iconClass)
      }

      // Get global resource states
      val globalsQuery = for {
        gr <- Models.globalResources if gr.gameId === gameId
      } yield gr

      val globalStates = globalsQuery.list map { res =>
        resourceState(res.resourceId, res.value)
      }

      // Get resource definitions
      val resourceDefinitionsQuery = for {
        g <- Models.games if g.id === gameId
        c <- Models.configs if c.id === g.configId
        r <- Models.resources if r.configId === c.id
      } yield r

      val resourceDefinitions = resourceDefinitionsQuery.list map { res =>
        resourceDefinition(res.id.get, res.name, res.resourceType, res.color, res.iconClass)
      }

      val game = queryResult(0)._1
      gameState(game.id.get,game.name,game.creatorId,game.created.toString,resourceDefinitions.toList,
        playerStates.toList,globalStates.toList)
    }
  }

  def addPoints(gameId:Int,userId:Int,newValue:Int,resourceId:Int) = {
    play.api.db.slick.DB.withSession{ implicit session =>
      val resourceQuery = for {
        p <- Models.players if p.gameId === gameId && p.userId === userId
        pr <- Models.playerResources if pr.playerId === p.id && pr.resourceId === resourceId
      } yield pr

      Query(resourceQuery.length).first match {
        case 1 =>
          val playerResourceId = resourceQuery.first().id
          val updateQuery = for {
            pr <- Models.playerResources if pr.id === playerResourceId
          } yield pr.value

          val retVal = updateQuery.update(newValue)
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

  def createConfig(name:Option[String] = None) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      val c = Config(None,name.getOrElse(""))
      (Models.configs returning Models.configs.map(_.id)) += c
    }
  }

  def listConfigs() : List[Config] = {
    play.api.db.slick.DB.withSession { implicit session =>
      Models.configs.list()
    }
  }

  def createGame(g:Game) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      val gameId = (Models.games returning Models.games.map(_.id)) += g

      val r = Models.resources.filter(_.configId === g.configId).filter(_.resourceType === "global").list
      r foreach { res =>
        Models.globalResources += Models.GlobalResource(None, gameId, res.id.get)
      }

      gameId
    }
  }

  def createResource(r:Resource) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      (Models.resources returning Models.resources.map(_.id)) += r
    }
  }

  // Create the player, as well as all applicable resources
  def createPlayer(p:Player) : Int = {
    play.api.db.slick.DB.withSession { implicit session =>
      val playerId = (Models.players returning Models.players.map(_.id)) += p

      val game = Models.games.filter(_.id === p.gameId).first()

      val r = Models.resources.filter(_.configId === game.configId).filter(_.resourceType === "player").list
      r foreach { res =>
        Models.playerResources += Models.PlayerResource(None, playerId, res.id.get)
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
          (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl ++ Models.configs.ddl ++ Models.resources.ddl
            ++ Models.playerResources.ddl ++ Models.userConfigs.ddl ++ Models.globalResources.ddl).drop
        }

        (Models.games.ddl ++ Models.users.ddl ++ Models.players.ddl ++ Models.configs.ddl ++ Models.resources.ddl
          ++ Models.playerResources.ddl ++ Models.userConfigs.ddl ++ Models.globalResources.ddl).create

        Models.users ++= Seq(
          Models.User(Some(1),"Kim", "kim@gmail.com"),
          Models.User(Some(2),"Squish", "squish@gmail.com"),
          Models.User(Some(3),"Dao", "dao@gmail.com"),
          Models.User(Some(4),"Fish", "fish@gmail.com"),
          Models.User(Some(5),"Gene", "gene@gmail.com"),
          Models.User(Some(6),"Ryan", "ryan@gmail.com")
        )

        Models.configs ++= Seq(
          Models.Config(Some(1),"Default"),
          Models.Config(Some(2),"Game Of Thrones")
        )

        Models.games ++= Seq(
          Models.Game(Some(1),"Game of Thrones",3,2),
          Models.Game(Some(2),"Smallworld",6,1)
        )

        Models.players ++= Seq(
          Models.Player(Some(1),2,Some(1),"123456",Some("#00FF00"),Some("QuimmFTW"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(2),2,Some(2),"234567",Some("#00FFFF"),Some("SquishyIshy"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(3),2,Some(3),"345678",Some("#FFFF00"),Some("Yuuzhan"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(4),2,Some(4),"456789",Some("#550055"),Some("FishOfFuck"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(5),2,Some(5),"567890",Some("#FF0055"),Some("GeneYes"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(6),2,Some(6),"678901",Some("#FF0000"),Some("Octavian"),Some("glyphicon glyphicon-music")),
          Models.Player(Some(7),1,None,"1")
        )

        Models.resources ++= Seq(
          Models.Resource(Some(1),"Sheep",None,None,1,"player","visible",None,None,None),
          Models.Resource(Some(2),"Supply",None,None,2,"player","visible",None,None,None),
          Models.Resource(Some(3),"Castles",None,None,2,"player","visible",None,None,None),
          Models.Resource(Some(4),"Influence",None,None,2,"player","visible",None,None,None)
        )

        Models.playerResources ++= Seq(
          Models.PlayerResource(Some(1),1,1),
          Models.PlayerResource(Some(2),2,1),
          Models.PlayerResource(Some(3),3,1),
          Models.PlayerResource(Some(4),4,1),
          Models.PlayerResource(Some(5),5,1),
          Models.PlayerResource(Some(6),6,1),
          Models.PlayerResource(Some(7),7,2),
          Models.PlayerResource(Some(7),7,3),
          Models.PlayerResource(Some(7),7,4)
        )
      }
    }
  }
}
