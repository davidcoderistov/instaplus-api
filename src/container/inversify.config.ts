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
import { ISeederService } from '../modules/seeder/ISeeder.service'
import { SeederService } from '../modules/seeder/seeder.service'
import { ICloudinaryService } from '../core/cloudinary/ICloudinary.service'
import { CloudinaryService } from '../core/cloudinary/cloudinary.service'
import { IFileRepository } from '../modules/file/IFile.repository'
import { FileRepository } from '../modules/file/file.repository'
import { IChatRepository } from '../modules/chat/interfaces/IChat.repository'
import { ChatRepository } from '../modules/chat/chat.repository'
import { IChatService } from '../modules/chat/interfaces/IChat.service'
import { ChatService } from '../modules/chat/chat.service'
import { ChatResolver } from '../modules/chat/chat.resolver'
import { IUserRepository } from '../modules/user/interfaces/IUser.repository'
import { UserRepository } from '../modules/user/user.repository'
import { IUserService } from '../modules/user/interfaces/IUser.service'
import { UserService } from '../modules/user/user.service'
import { UserResolver } from '../modules/user/user.resolver'
import { INotificationRepository } from '../modules/notification/interfaces/INotification.repository'
import { NotificationRepository } from '../modules/notification/notification.repository'
import { INotificationService } from '../modules/notification/interfaces/INotification.service'
import { NotificationService } from '../modules/notification/notification.service'
import { NotificationResolver } from '../modules/notification/notification.resolver'
import { IPostRepository } from '../modules/post/interfaces/IPost.repository'
import { PostRepository } from '../modules/post/post.repository'
import { IPostService } from '../modules/post/interfaces/IPost.service'
import { PostService } from '../modules/post/post.service'
import { IPostLoader } from '../modules/post/interfaces/IPost.loader'
import { PostLoader } from '../modules/post/post.loader'
import { PostResolver } from '../modules/post/post.resolver'
import { ISearchHistoryRepository } from '../modules/search-history/interfaces/ISearchHistory.repository'
import { SearchHistoryRepository } from '../modules/search-history/search-history.repository'
import { ISearchHistoryService } from '../modules/search-history/interfaces/ISearchHistory.service'
import { SearchHistoryService } from '../modules/search-history/search-history.service'
import { SearchHistoryResolver } from '../modules/search-history/search-history.resolver'


export const bindings = new ContainerModule(bind => {
    bind<IHttpServerService>(TYPES.IHttpServerService).to(HttpServerService)
    bind<IWsServerService>(TYPES.IWsServerService).to(WsServerService)
    bind<IApolloServerService>(TYPES.IApolloServerService).to(ApolloServerService)
    bind<IGraphQLSchemaService>(TYPES.IGraphQLSchemaService).to(GraphQLSchemaService)

    bind<IDatabaseService>(TYPES.IDatabaseService).to(DatabaseService)

    bind<ISeederService>(TYPES.ISeederService).to(SeederService)

    bind<ICloudinaryService>(TYPES.ICloudinaryService).to(CloudinaryService)

    bind<IFileRepository>(TYPES.IFileRepository).to(FileRepository)

    bind<IChatRepository>(TYPES.IChatRepository).to(ChatRepository)
    bind<IChatService>(TYPES.IChatService).to(ChatService)
    bind<ChatResolver>(ChatResolver).toSelf()

    bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository)
    bind<IUserService>(TYPES.IUserService).to(UserService)
    bind<UserResolver>(UserResolver).toSelf()

    bind<INotificationRepository>(TYPES.INotificationRepository).to(NotificationRepository)
    bind<INotificationService>(TYPES.INotificationService).to(NotificationService)
    bind<NotificationResolver>(NotificationResolver).toSelf()

    bind<IPostRepository>(TYPES.IPostRepository).to(PostRepository)
    bind<IPostService>(TYPES.IPostService).to(PostService)
    bind<IPostLoader>(TYPES.IPostLoader).to(PostLoader)
    bind<PostResolver>(PostResolver).toSelf()

    bind<ISearchHistoryRepository>(TYPES.ISearchHistoryRepository).to(SearchHistoryRepository)
    bind<ISearchHistoryService>(TYPES.ISearchHistoryService).to(SearchHistoryService)
    bind<SearchHistoryResolver>(SearchHistoryResolver).toSelf()
})