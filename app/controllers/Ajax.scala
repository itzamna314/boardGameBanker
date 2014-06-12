package controllers

import play.api.mvc.{BodyParser, Action, Controller}
import play.api.libs.json._
import models._

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

      case Some(u:Models.User) => Json.obj(
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

  def resetDb = Action { implicit request =>
    if ( Dal.isTest ) {
      Dal.resetTest()
      Ok(JsBoolean(true))
    }
    else
      NotFound("")
  }
}
