package controllers

import java.text.SimpleDateFormat

import models.Models._
import play.api.mvc._
import play.api.libs.json._
import models._
import java.util.UUID

/**
 * Controllers that correspond to AJAX methods that will be called from angular
 * All controller actions should serve JSON responses rather than HTML
 * Created by Kyl on 6/7/2014.
 */
object Ajax extends Controller {
  def listGames(userId:String) = Action {
    val games = Dal.listGames(userId.toInt)
    val gamesJson = games map {g =>
      val creator = Dal.getUser(g.creatorId).get

      Json.obj(
        "name" -> g.name,
        "id" -> g.id,
        "created" -> new SimpleDateFormat("MM/dd/yy HH:mm").format(g.created),
        "creator" -> Json.obj(
          "id" -> creator.id,
          "username" -> creator.name,
          "email" -> creator.email
        )
      )
    }
    val jsonArr = Json.obj("games" -> Json.toJson(gamesJson.toSeq))
    Ok(jsonArr)
  }

  def gameDetail(gameId:String,userId:String) = Action {
    val gameState = getGameState(gameId.toInt,userId.toInt)
    val players = (gameState \ "players").asOpt[List[JsObject]]

    if ( players.isDefined && players.get.length > 0 ) {
      Ok(gameState)
    }
    else {
      BadRequest(Json.obj("error" -> "GameNotFound", "message" -> (gameId + " is not a valid game ID")))
    }
  }

  def addPoints(gameId:String,userId:String) = Action(parse.json) { implicit request =>
    val numberOfPoints = (request.body \ "number").asOpt[Int].getOrElse(0)
    if (numberOfPoints != 0 && Dal.addPoints(gameId.toInt, userId.toInt, numberOfPoints)) {
      Ok(getGameState(gameId.toInt,userId.toInt))
    } else {
      BadRequest(Json.obj("error" -> "IllegalUpdate","message" -> ("Game ID: " + gameId + ", User ID: " + userId)))
    }
  }

  def findUser(emailOrUsername:String) = Action {
    val user = Dal.findUser(emailOrUsername)
    val userJson = user match {
      case None => Json.obj(
        "found" -> JsBoolean(false),
        "email" -> JsNull,
        "username" -> JsNull,
        "id" -> JsNull
      )

      case Some(u) => Json.obj(
        "found" -> JsBoolean(true),
        "email" -> u.email,
        "username" -> u.name,
        "id" -> u.id
      )
    }

    Ok(userJson)
  }

  def createUser = Action(parse.json) { implicit request =>
    val name = (request.body \ "username").asOpt[String]
    val email = (request.body \ "email").asOpt[String]

    if ( name.isDefined && email.isDefined ) {
      val createdId = Dal.createUser(Models.User(None,name.get,email.get))
      Ok(Json.obj("error" -> JsNull, "message" -> "", "id" -> createdId))
    }
    else {
      BadRequest(Json.obj("error" -> "BadParameters", "message" -> "Missing username and/or e-mail"))
    }
  }

  def createGame = Action(parse.json){ implicit request =>
    val reqJson = request.body.asOpt[JsObject]
    val reqObj = parseCreateGameJson(reqJson)

    reqObj match {
      case Some(req : createGameRequest) =>
        val gameId = Dal.createGame(Game(None,req.name,req.creator.id.get))
        Dal.createPlayer(Player(None,gameId,req.creator.id,UUID.randomUUID().toString))
        req.players foreach { p=>
          val uuid = UUID.randomUUID().toString
          Dal.createPlayer(Player(None,gameId,None,uuid))
          notifyPlayer(p.email,req.creator,uuid,req.name,routes.Application.index().absoluteURL())
        }
        Ok(Json.obj("error" -> JsNull,"message" -> ""))
      case _ =>
        BadRequest(Json.obj("error" -> "IllegalJSON","message" -> ("Received: " + request.body)))
    }
  }

  def joinGame = Action(parse.json) { implicit request =>
    val reqJson = request.body.asOpt[JsObject]
    val reqObj = parseJoinGameJson(reqJson)

    reqObj match {
      case Some(req) =>
        val updatedPlayer = Dal.bindPlayer(req.userId,req.uuid)
        updatedPlayer match {
          case "UUIDInvalid" =>
            val errorMessage = "Token " + req.uuid + " is not a valid token"
            BadRequest(Json.obj("error" -> "InvalidToken", "message" -> errorMessage))
          case "PlayerExisted" =>
            BadRequest(Json.obj("error" -> "PlayerExisted","message" -> "You are already in this game!"))
          case "" =>
            Ok(Json.obj("error" -> JsNull, "message" -> ""))

        }
      case None =>
        BadRequest(Json.obj("error" -> "IllegalJSON","message" -> ("Received: " + request.body)))
    }
  }

  def resetDb = Action { implicit request =>
    if ( Dal.isTest ) {
      Dal.resetTest()
      Ok(JsBoolean(true))
    }
    else
      NotFound("")
  }

  private case class createGameRequest(name:String,creator:User,players:Array[createGameRequestPlayer])
  private case class createGameRequestPlayer(email:String)
  private case class joinGameRequest(userId:Int,uuid:String)

  // Parse JSON game request into strongly-type scala game request
  // Return Some for valid request, else None
  private def parseCreateGameJson(json:Option[JsObject]) : Option[createGameRequest] = {
    json match {
      case Some(j:JsObject) =>
        val gameName = (j \ "title").asOpt[String]
        val players = (j \ "players").asOpt[Array[JsObject]]

        if ( gameName.isDefined && players.isDefined ) {
          val playersArr = players.get filter { p =>
            val isCreator = (p \ "isCreator").asOpt[Boolean].getOrElse(false)

            (p \ "email").asOpt[String] match {
              case Some(_) => !isCreator
              case None => false
            }
          } map {
            p =>
              createGameRequestPlayer((p \ "email").as[String])
          }

          val creator : Seq[User] = players.get filter { p =>
            val isCreator = (p \ "isCreator").asOpt[Boolean].getOrElse(false)
            isCreator
          } map { p =>
            val email = (p \ "email").asOpt[String]
            email match {
              case Some(e:String) =>
                Dal.findUser(e)
              case None =>
                None
            }
          } filter(_.isDefined) map (_.get)

          if ( creator.length == 1 )
            Some(createGameRequest(gameName.get,creator(0),playersArr))
          else
            None
        }
        else
          None
      case _ =>
        None
    }
  }

  private def parseJoinGameJson(json:Option[JsObject]) : Option[joinGameRequest] = {
    json match {
      case Some(j:JsObject) =>
        val userId = (j \ "userId").asOpt[Int]
        val uuid = (j \ "token").asOpt[String]

        if ( userId.isDefined && uuid.isDefined ) {
          Some(joinGameRequest(userId.get,uuid.get))
        }
        else {
          None
        }
      case None =>
        None
    }
  }

  private def notifyPlayer(email:String,creator:User,uuid:String,gameName:String,url:String) = {
    import play.api.Play.current
    import com.typesafe.plugin._

    val mail = use[MailerPlugin].email
    mail.setFrom("Board Game Banker <boardgamebanker@gmail.com>")
    mail.setSubject("Care for a nice game of " + gameName + "?")
    mail.setRecipient(email)
    mail.sendHtml("<html><body><p>You have received an invitation to play " + gameName + " by " + creator.name +
      "&lt;" + creator.email + "&gt;." + "To accept, " +
      "<a href=\"" + url + "#/joingame/" + uuid + "\">click here</a> to go to board game banker.<br/><br/>" +
      "Alternately, enter this code in the app:<br/><br/>" + uuid + ".</p></body></html>")

  }

  private def getGameState(gameId:Int,userId:Int) : JsObject = {
    val gamePlayers = Dal.getGame(gameId.toInt)
    if ( gamePlayers.length > 0 ) {
      val game = gamePlayers(0)._1
      val playersJson = gamePlayers map { gp =>
        val player = gp._2
        val user = gp._3
        Json.obj(
          "username" -> user.name,
          "email" -> user.email,
          "playerId" -> player.id,
          "score" -> player.score,
          "isCreator" -> JsBoolean(user.id.get == game.creatorId),
          "isMe" -> JsBoolean(user.id.get == userId.toInt)
        )
      }

      val gameJson = Json.obj(
        "name" -> game.name,
        "created" -> game.created,
        "id" -> game.id,
        "myscore" -> gamePlayers.filter(_._3.id == Some(userId.toInt))(0)._2.score
      )

      Json.obj("game" -> gameJson, "players" -> Json.toJson(playersJson.toSeq))
    } else {
      Json.obj("error" -> "NoPlayers","message" -> "found no players")
    }
  }
}
