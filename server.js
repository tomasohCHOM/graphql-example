const express = require("express");
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const app = express();

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

app.use("/graphql", createHandler({ schema: schema }));
// Generate a playground to make queries.
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
app.listen(5000, () => console.log("Server running in port 5000"));
