package controllers

import models._
import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.db.slick.Config.driver.simple._
import play.api.data._
import play.api.data.Forms._
import play.api.Play.current

object Application extends Controller {

  def index = Action {
    Ok(views.html.welcome())
  }

  def listGames = DBAction { implicit rs =>
    Ok(views.html.listgames())
  }

  def getNewGame = Action { implicit request =>
    Ok(views.html.newgame())
  }

  def joinGame = Action { implicit request =>
    val tokenQuery = request.queryString.get("token")
    val token = tokenQuery match {
      case Some(tq) =>
        tq.length match {
          case 1 =>
            tq(0)
          case _ => ""
        }
      case None => ""
    }

    Ok(views.html.joingame(token))
  }

  def testJavascripts = Action { implicit request =>
    Ok(views.html.js_spec())
  }
}