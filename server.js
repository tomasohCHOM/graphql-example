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
const players = require("./data/players.json");
const matches = require("./data/matches.json");

const app = express();

/**
 * Player Object Type. Contains playerId, gamer tag, a list of characters, and ranking.
 */
const PlayerType = new GraphQLObjectType({
  name: "Player",
  description:
    "This represents a player's id, gamer tag, characters that they play, and unofficial ranking.",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    gamerTag: { type: new GraphQLNonNull(GraphQLString) },
    characters: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
    rank: { type: GraphQLInt },
    matches: {
      type: MatchType,
      resolve: (player) => {
        return matches.find((match) => match.playerId === player.id);
      },
    },
  }),
});

/**
 * Match Object Type. Contains the match id, the title, and the id of the player associated to
 * preexisting players.
 */
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
      type: new GraphQLList(GraphQLString),
      description: "List of All Players",
      resolve: () => players,
    },
    match: {
      type: MatchType,
      description: "A Single Match",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => matches.find((match) => match.id === args.id),
    },
    matches: {
      type: new GraphQLList(MatchType),
      description: "List of All Matches",
      resolve: () => matches,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addPlayer: {
      type: PlayerType,
      description: "Add a player",
      args: {
        gamerTag: { type: GraphQLNonNull(GraphQLString) },
        characters: { type: GraphQLNonNull(GraphQLList(GraphQLInt)) },
        ranking: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        const player = {
          id: players.length + 1,
          gamerTag: args.name,
          characters: args.characters,
          authorId: args.authorId,
        };
        players.push(player);
        return player;
      },
    },
    addMatch: {
      type: MatchType,
      description: "Add a match",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const match = { id: matches.length + 1, name: args.name };
        matches.push(match);
        return match;
      },
    },
  }),
});

/**
 * [Old Schema]
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

/**
 * Create a GraphQL Schema with necessary resolvers
 */
const newSchema = new GraphQLSchema({
  query: RootQueryType,
});

app.use("/graphql", createHandler({ schema: newSchema }));
// Generate a playground to make queries.
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
app.listen(5000, () => console.log("Server running in port 5000"));
