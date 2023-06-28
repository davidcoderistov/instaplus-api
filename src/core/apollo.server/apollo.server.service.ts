import { ApolloServer, GraphQLRequestContextDidResolveOperation } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../container/types'
import { IHttpServerService } from '../http.server/IHttpServer.service'
import { IWsServerService } from '../ws.server/IWsServer.service'
import { IGraphQLSchemaService } from '../graphql.schema/IGraphQLSchema.service'
import { IApolloServerService } from './IApolloServer.service'
import { Context } from '../../shared/types'
import { InvalidSessionException } from '../../shared/exceptions/invalid.session.exception'


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
    }
}