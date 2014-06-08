import org.junit.runner.RunWith
import play.api.libs.json.Json
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

  }
}
