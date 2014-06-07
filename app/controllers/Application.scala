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
    Ok(views.html.index("Your new application is ready."))
  }

  def listGames = DBAction { implicit rs =>
    val games = Dal.listGames
    Ok(views.html.listgames(games))
  }

  def getNewGame = Action { implicit request =>
    Ok(views.html.addgame(Forms.gameForm))
  }

  def createNewGame = DBAction{ implicit rs =>
      Forms.gameForm.bindFromRequest.fold(
        errors => BadRequest("Error!"),
        g => {
          Models.games += g
          Redirect(routes.Application.listGames)
        }
      )
  }

  def testJavascripts = Action { implicit request =>
    Ok(views.html.js_spec())
  }

}