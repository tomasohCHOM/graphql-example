const express = require("express");
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const {
  GraphQLSchema,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const { players } = require("./data/players.json");
const { matches } = require("./data/matches.json");

const app = express();

const PlayerType = new GraphQLObjectType({
  name: "Player",
  description:
    "This represents a player's id, gamertag, characters that they play, and unofficial ranking.",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    gamerTag: { type: new GraphQLNonNull(GraphQLString) },
    characters: { type: new GraphQLList(GraphQLString) },
    matches: {
      type: MatchType,
      resolve: (player) => {
        return matches.find((match) => match.playerId === player.id);
      },
    },
  }),
});

const MatchType = new GraphQLObjectType({
  name: "Matches",
  description:
    "All of the matches that have happened with the existing players",
  fields: () => ({
    matchId: { type: new GraphQLNonNull(GraphQLInt) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    playerId: { type: new GraphQLNonNull(GraphQLInt) },
    players: {
      type: PlayerType,
      resolve: (match) => {
        return players.find((player) => player.id === match.playerId);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    player: {
      type: PlayerType,
      description: "A Single Player",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        players.find((player) => player.id === args.id),
    },
    players: {
      type: new GraphQLList(PlayerType),
      description: "List of All Players",
      resolve: () => players,
    },
    matches: {
      type: new GraphQLList(MatchType),
      description: "List of All Matches",
      resolve: () => matches,
    },
    match: {
      type: MatchType,
      description: "A Single Match",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => matches.find((match) => match.id === args.id),
    },
  }),
});

/**
 * Create a GrahQL Schema with necessary resolvers
 */
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => "Hello World!",
      },
    },
  }),
});

const newSchema = new GraphQLSchema({
  query: RootQueryType,
});

app.use("/graphql", createHandler({ schema: newSchema }));
// Generate a playground to make queries.
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
app.listen(5000, () => console.log("Server running in port 5000"));
