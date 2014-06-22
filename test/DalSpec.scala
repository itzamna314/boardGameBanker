import models.Models._
import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._
import models._

import play.api.test._

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
      val dao = Dal.findUser("dao@gmail.com")
      empty must_== None
      dao must_== Some(User(Some(3),"Dao","dao@gmail.com"))
    }

    "list games" in new resetDal {
      val games = Dal.listGames()
      games.length must_== 2
    }

    "create a user" in new resetDal {
      val user = User(None,"Cyril Figgis","elcontante@sanmarcos.com")
      Dal.createUser(user)
      val cyril = Dal.findUser("elcontante@sanmarcos.com")
      cyril must_== Some(User(Some(7),"Cyril Figgis","elcontante@sanmarcos.com"))
    }

    "create a game" in new resetDal {
      val game = Game(None,"Shoots & Ladders")
      val gameId = Dal.createGame(game)
      gameId must_== 3
      val games = Dal.listGames()
      games.length must_== 3
      games(2) must_== Game(Some(3),"Shoots & Ladders")
    }

    "create a player" in new resetDal {
      val player = Player(None,2,Some(1),"789456")
      val playerId = Dal.createPlayer(player)
      playerId must_== 7
    }
  }
}

trait resetDal extends WithApplication {
  def before = Dal.resetTest()
}
