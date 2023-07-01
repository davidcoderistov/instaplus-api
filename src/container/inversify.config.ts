import { ContainerModule } from 'inversify'
import { TYPES } from './types'
import { IHttpServerService } from '../core/http.server/IHttpServer.service'
import { HttpServerService } from '../core/http.server/http.server.service'
import { IWsServerService } from '../core/ws.server/IWsServer.service'
import { WsServerService } from '../core/ws.server/ws.server.service'
import { IApolloServerService } from '../core/apollo.server/IApolloServer.service'
import { ApolloServerService } from '../core/apollo.server/apollo.server.service'
import { IGraphQLSchemaService } from '../core/graphql.schema/IGraphQLSchema.service'
import { GraphQLSchemaService } from '../core/graphql.schema/graphql.schema.service'
import { IDatabaseService } from '../core/database/IDatabase.service'
import { DatabaseService } from '../core/database/database.service'
import { IChatRepository } from '../modules/chat/interfaces/IChat.repository'
import { ChatRepository } from '../modules/chat/chat.repository'
import { IChatService } from '../modules/chat/interfaces/IChat.service'
import { ChatService } from '../modules/chat/chat.service'
import { ChatResolver } from '../modules/chat/chat.resolver'


export const bindings = new ContainerModule(bind => {
    bind<IHttpServerService>(TYPES.IHttpServerService).to(HttpServerService)
    bind<IWsServerService>(TYPES.IWsServerService).to(WsServerService)
    bind<IApolloServerService>(TYPES.IApolloServerService).to(ApolloServerService)
    bind<IGraphQLSchemaService>(TYPES.IGraphQLSchemaService).to(GraphQLSchemaService)

    bind<IDatabaseService>(TYPES.IDatabaseService).to(DatabaseService)

    bind<IChatRepository>(TYPES.IChatRepository).to(ChatRepository)
    bind<IChatService>(TYPES.IChatService).to(ChatService)
    bind<ChatResolver>(ChatResolver).toSelf()
})