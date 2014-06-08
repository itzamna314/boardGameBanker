package controllers

import play.api.data.Forms._
import play.api.data._
import models.Models._

/**
 * Object wrapper for all forms
 * Created by Kyl on 6/5/2014.
 */
object Forms {
  val gameForm = Form(
    mapping(
      "id" -> optional(number()),
      "name" -> text()
    )(Game.apply)(Game.unapply)
  )

  val createUserForm = Form(
    mapping(
      "id" -> optional(number()),
      "name" -> text(),
      "email" -> text()
    )(User.apply)(User.unapply)
  )
}
