name := "board-game-banker"

version := "1.0"

scalaVersion := "2.10.3"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  "mysql" % "mysql-connector-java" % "5.1.24",
  "org.scala-lang" % "scala-reflect" % "2.10.3",
  "com.typesafe.slick" %% "slick" % "2.0.0",
  "com.typesafe.play" %% "play-slick" % "0.6.0.1"
)     

play.Project.playScalaSettings
