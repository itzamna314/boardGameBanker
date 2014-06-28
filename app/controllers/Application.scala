package controllers

import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.main("Board Game Banker",false))
  }

  def testJavascripts = Action { implicit request =>
    Ok(views.html.main("JS Unit Testing",true))
  }
}