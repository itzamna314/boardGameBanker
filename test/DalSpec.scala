import models.Models.User
import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._
import models._

import play.api.test._
import play.api.test.Helpers._

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
@RunWith(classOf[JUnitRunner])
class DalSpec extends Specification {

  "Dal" should {
    "find users" in new resetDal {
      val empty = Dal.findUser("blaaaaa")
      val dao = Dal.findUser("Dao")
      empty must_== None
      dao must_== Some(User(Some(3),"Dao","dao@gmail.com"))
    }

    "list games" in new resetDal {
      val games = Dal.listGames()
      games.length must_== 2
    }
  }
}

trait resetDal extends WithApplication {
  def before = Dal.resetTest()
}
