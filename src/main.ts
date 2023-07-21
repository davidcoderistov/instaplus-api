import 'reflect-metadata'
import container from './container/container'
import { TYPES } from './container/types'
import { IHttpServerService } from './core/http.server/IHttpServer.service'
import { IWsServerService } from './core/ws.server/IWsServer.service'
import { IApolloServerService } from './core/apollo.server/IApolloServer.service'
import { IGraphQLSchemaService } from './core/graphql.schema/IGraphQLSchema.service'
import { IDatabaseService } from './core/database/IDatabase.service'
import { ICloudinaryService } from './core/cloudinary/ICloudinary.service'


(async () => {
    const httpServerService = container.get<IHttpServerService>(TYPES.IHttpServerService)
    httpServerService.initialize()

    await container.get<ICloudinaryService>(TYPES.ICloudinaryService).initialize()
    await container.get<IDatabaseService>(TYPES.IDatabaseService).initialize()
    await container.get<IGraphQLSchemaService>(TYPES.IGraphQLSchemaService).initialize()

    container.get<IWsServerService>(TYPES.IWsServerService).initialize()

    const apolloServerService = container.get<IApolloServerService>(TYPES.IApolloServerService)

    await apolloServerService.initialize()

    const port = Number(process.env.PORT || 8080)
    httpServerService.getHttpServer().listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
})()