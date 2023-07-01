import { IChatService } from '../modules/chat/interfaces/IChat.service'

export const TYPES = {
    IHttpServerService: Symbol.for('IHttpServerService'),
    IWsServerService: Symbol.for('IWsServerService'),
    IApolloServerService: Symbol.for('IApolloServerService'),
    IGraphQLSchemaService: Symbol.for('IGraphQLSchemaService'),
    IDatabaseService: Symbol.for('IDatabaseService'),
    IChatRepository: Symbol.for('IChatRepository'),
    IChatService: Symbol.for('IChatService'),
    ChatResolver: Symbol.for('ChatResolver'),
}