package controllers

import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  def testJavascripts = Action { implicit request =>
    Ok(views.html.js_spec())
  }
}