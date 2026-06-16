import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import { typeDefs, resolvers } from './schema';
import dbconnection from './db.connection';
import { checkAuth } from './middlewares/auth.middleware';

const app = express();
const port = process.env.PORT || 3000;


async function startServer() {
    // 1. Connect to Database
    await dbconnection();

    // 2. Initialize Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (error) => {
            console.log(error);
            return error;
        }
    });

    // 3. Start Apollo Server
    await server.start();

    // 4. Apply Express middleware with context
    app.use(
        '/graphql',
        cors({
            origin: 'http://localhost:5173',
            credentials: true
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req, res }) => {
                const user = await checkAuth(req);
                return { user, req, res };
            },
        })
    );

    // 5. Start listening
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
    });
}

startServer().catch((err) => {
    console.error('Error starting server:', err);
});
