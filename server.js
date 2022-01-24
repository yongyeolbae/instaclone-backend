import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { graphqlUploadExpress } from "graphql-upload";
import { typeDefs, resolvers } from "./schema";
import { handleGetUser } from "./users/users.utils";

const PORT = process.env.PORT;

const startServer = async () => {
  const app = express();
  app.use("/uploads", express.static(`${process.cwd()}/uploads`));
  app.use(graphqlUploadExpress());
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams, webSocket, context) {
        console.log("onConnect!");
        const { token } = connectionParams;
        if (!token) {
          throw new Error("토큰이 존재하지 않기 때문에 웹 소켓에 연결할 수 없습니다.");
        }
        const loggedInUser = await handleGetUser(token);
        return { loggedInUser };
      },
      onDisconnect(webSocket, context) {
        console.log("onDisconnect!");
      },
    },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      if (req) {
        const loggedInUser = await handleGetUser(req?.headers?.token);
        if (loggedInUser === null) {
          return null;
        }
        return { loggedInUser };
      }
    },
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground,
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();