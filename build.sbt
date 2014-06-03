name := "board-game-banker"

version := "1.0"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  "com.typesafe.play" %% "play-slick" % "0.6.0.1"
)     

play.Project.playScalaSettings
