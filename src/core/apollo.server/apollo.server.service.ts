import { ApolloServer, GraphQLRequestContextDidResolveOperation } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../container/types'
import { IHttpServerService } from '../http.server/IHttpServer.service'
import { IWsServerService } from '../ws.server/IWsServer.service'
import { IGraphQLSchemaService } from '../graphql.schema/IGraphQLSchema.service'
import { IApolloServerService } from './IApolloServer.service'
import { Context } from '../../shared/types'
import { InvalidSessionException } from '../../shared/exceptions'
import { expressMiddleware } from '@apollo/server/express4'
import { serializeRefreshToken, deserializeRefreshToken, getUserIdFromAuthHeader } from '../../shared/utils/token'


@injectable()
export class ApolloServerService implements IApolloServerService {

    constructor(
        @inject(TYPES.IHttpServerService) private readonly _httpServerService: IHttpServerService,
        @inject(TYPES.IWsServerService) private readonly _wsServerService: IWsServerService,
        @inject(TYPES.IGraphQLSchemaService) private readonly _graphQLSchemaService: IGraphQLSchemaService) {
    }

    public async initialize(): Promise<void> {
        const httpServer = this._httpServerService.getHttpServer()
        const drainWsServer = this._wsServerService.dispose

        const server = new ApolloServer({
            schema: this._graphQLSchemaService.getGraphQLSchema(),
            introspection: process.env.NODE_ENV !== 'production',
            plugins: [
                ApolloServerPluginDrainHttpServer({ httpServer }),
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await drainWsServer()
                            },
                        }
                    },
                    async requestDidStart() {
                        return {
                            async didResolveOperation(requestContext: GraphQLRequestContextDidResolveOperation<Context>) {
                                switch (requestContext.operationName) {
                                    case 'signUp':
                                        return
                                    case 'login':
                                        return
                                    case 'refresh':
                                        return
                                    case 'logout':
                                        return
                                }
                                if (!requestContext.contextValue.userId) {
                                    throw new InvalidSessionException()
                                }
                            },
                        }
                    },
                },
            ],
        })

        await server.start()

        const app = this._httpServerService.getExpressApp()

        app.use('/api', expressMiddleware(server as any, {
            context: async ({ req, res }) => {
                return {
                    setRefreshTokenCookie(refreshToken: string, immediate: boolean = false) {
                        res.setHeader('Set-Cookie', serializeRefreshToken(refreshToken, immediate))
                    },
                    getRefreshTokenCookie() {
                        let headerCookie = req.headers.cookie
                        if (typeof headerCookie !== 'string') {
                            headerCookie = ''
                        }
                        return deserializeRefreshToken(headerCookie)
                    },
                    userId: await getUserIdFromAuthHeader(req.headers),
                }
            },
        }))
    }
}