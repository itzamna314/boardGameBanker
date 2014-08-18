import models.Models._
import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._
import models._
import org.specs2.specification.Scope
import org.specs2.execute.{ AsResult, Result }

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
      val games = Dal.listGames(1)
      games.length must_== 1
    }

    "get game detail" in new resetDal {
      val game = Dal.getGame(2)
      game.id must_== 2
      game.name must_== "Smallworld"
      game.creatorId must_== 6
      game.players.length must_== 6
      game.players foreach { p =>
        p.resources.length must_== 1
        p.resources(0).value must_== 0
      }
    }

    "create a user" in new resetDal {
      val user = User(None,"Cyril Figgis","elcontante@sanmarcos.com")
      Dal.createUser(user)
      val cyril = Dal.findUser("elcontante@sanmarcos.com")
      cyril must_== Some(User(Some(7),"Cyril Figgis","elcontante@sanmarcos.com"))
    }

    "create a config" in new resetDal {
      val initialLength = Dal.listConfigs().length
      Dal.createConfig(None)
      Dal.createConfig(Some("FooBar"))

      Dal.listConfigs().length must_== initialLength + 2
    }

    "create a game" in new resetDal {
      val game = Game(None,"Shoots & Ladders",1,1)
      val gameId = Dal.createGame(game)
      Dal.createPlayer(Player(None,gameId,Some(1),"12345"))
      val games = Dal.listGames(1)
      games.length must_== 2
      games(1).name must_== "Shoots & Ladders"
      games(1).creatorId must_== 1
      val gameDetail = Dal.getGame(gameId)
      gameDetail.players.length must_== 1
      gameDetail.players(0).resources.length must_== 1
    }

    "create a player" in new resetDal {
      val player = Player(None,2,Some(1),"789456")
      val playerId = Dal.createPlayer(player)
    }

    "bind a player to a user" in new resetDal {
      // Try to bind user Kim to player 7 (unbound, UUID = 1)
      val kimUser = Dal.findUser("kim@gmail.com")
      Dal.bindPlayer(kimUser.get.id.get,"1") must_== ""
      val gameDetails = Dal.getGame(1)
      gameDetails.players(0).userId must_== kimUser.get.id.get
      // Create a new player in game of thrones, then try to bind Kim to it.
      // Should fail
      val newPlayer = Player(None,1,None,"2")
      Dal.createPlayer(newPlayer)
      Dal.bindPlayer(kimUser.get.id.get,"2") must_== "PlayerExisted"
    }

    "add points" in new resetDal {
      Dal.addPoints(2,1,1) must_!= 0
      Dal.addPoints(2,5,1,Some(1)) must_!= 0
    }

    "delete a game" in new resetDal {
      Dal.deleteGame(2,6)
      val games = Dal.listGames(6)
      games.length must_== 0
    }

    "get game detail with multiple resources" in new resetDal {
      // First, bind a user to the open player slot so this is a valid
      // game.
      val kimUser = Dal.findUser("kim@gmail.com")
      Dal.bindPlayer(kimUser.get.id.get,"1") must_== ""
      val game = Dal.getGame(1)
      game.players.length must_== 1
      game.players(0).resources.length must_== 3
      game.players(0).resources(0).id must_== 4
      game.players(0).resources(1).id must_== 3
      game.players(0).resources(2).id must_== 2

      game.playerResources.length must_== 3
      game.playerResources(0).id must_== game.players(0).resources(0).id
      game.playerResources(0).name must_== "Influence"
      game.playerResources(1).id must_== game.players(0).resources(1).id
      game.playerResources(1).name must_== "Castles"
      game.playerResources(2).id must_== game.players(0).resources(2).id
      game.playerResources(2).name must_== "Supply"
    }
  }
}

abstract class WithEnv(setup: => Unit, teardown: => Unit, val app: FakeApplication = FakeApplication())
  extends Around
  with Scope {
  implicit def implicitApp = app
  override def around[T: AsResult](t: => T): Result = {
    Helpers.running(app)(AsResult.effectively{
      setup
      try {
        t
      } finally {
        teardown
      }
    })
  }
}

class resetDal() extends WithEnv(Dal.resetTest(),None) {}