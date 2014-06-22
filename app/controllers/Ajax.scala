package controllers

import models.Models.{Game, Player}
import play.api.mvc.{BodyParser, Action, Controller}
import play.api.libs.json._
import models._
import java.util.UUID

/**
 * Controllers that correspond to AJAX methods that will be called from angular
 * All controller actions should serve JSON responses rather than HTML
 * Created by Kyl on 6/7/2014.
 */
object Ajax extends Controller {
  def listGames = Action {
    val games = Dal.listGames()
    val gamesJson = games map {g =>
        Json.obj(
          "name" -> g.name,
          "id" -> g.id
        )
      }
    val jsonArr = Json.toJson(gamesJson.toSeq)
    Ok(jsonArr)
  }

  def getUser(emailOrUsername:String) = Action {
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
    val name = (request.body \ "name").asOpt[String]
    val email = (request.body \ "email").asOpt[String]

    if ( name.isDefined && email.isDefined ) {
      Dal.createUser(Models.User(None,name.get,email.get))
      Ok(Json.obj("error" -> JsNull, "message" -> ""))
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
        val gameId = Dal.createGame(Game(None,req.name))
        req.players foreach { p=>
          val uuid = UUID.randomUUID().toString
          Dal.createPlayer(Player(None,gameId,None,uuid))
        }
        Ok(Json.obj("error" -> JsNull,"message" -> ""))
      case _ =>
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

  private case class createGameRequest(name:String,players:Array[createGameRequestPlayer])
  private case class createGameRequestPlayer(email:String)

  // Parse JSON game request into strongly-type scala game request
  // Return Some for valid request, else None
  private def parseCreateGameJson(json:Option[JsObject]) : Option[createGameRequest] = {
    json match {
      case Some(j:JsObject) =>
        val gameName = (j \ "gamename").asOpt[String]
        val players = (j \ "players").asOpt[Array[JsObject]]

        if ( gameName.isDefined && players.isDefined ) {
          val playersArr = players.get filter {
            p => (p \ "email").asOpt[String] match {
              case Some(_) => true
              case None => false
            }
          } map {
            p =>
              createGameRequestPlayer((p \ "email").as[String])
          }
          Some(createGameRequest(gameName.get,playersArr))
        }
      case _ =>
        None
    }

    None
  }

  private def notifyPlayer(email:String,creator:String,uuid:String,gameName:String) = {

  }
}
