import org.junit.runner.RunWith
import play.api.libs.json.{JsNull, Json}
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner

import play.api.test._
import play.api.test.Helpers._

/**
 * Test Ajax endpoints
 * Created by Kyl on 6/7/2014.
 */
@RunWith(classOf[JUnitRunner])
class AjaxSpec extends Specification {
  "Ajax" should {

    "find a user" in new resetDal {
      val found = route(FakeRequest(GET, "/ajax/getuser/Squish")).get
      val notFound = route(FakeRequest(GET, "/ajax/getuser/Jesus")).get

      status(found) must equalTo(OK)
      status(notFound) must equalTo(OK)
      contentType(found) must beSome("application/json")
      contentType(notFound) must beSome("application/json")

      val foundJson = contentAsJson(found)
      val notFoundJson = contentAsJson(notFound)

      foundJson \ "found" must_== Json.toJson(true)
      notFoundJson \ "found" must_== Json.toJson(false)
    }

    "add a user" in new resetDal {
      val toAdd = Json.obj("username" -> "Summer Smith", "email" -> "ssmith@needfulthings.com")
      val added = route(FakeRequest(POST,"/ajax/createuser").withJsonBody(toAdd)).get
      status(added) must equalTo(OK)
      contentType(added) must beSome("application/json")
      val addedJson = contentAsJson(added)
      addedJson \ "error" must_== JsNull

      val found = route(FakeRequest(GET, "/ajax/getuser/ssmith@needfulthings.com")).get
      val foundJson = contentAsJson(found)
      foundJson \ "found" must_== Json.toJson(true)

    }
  }
}
