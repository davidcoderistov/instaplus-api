import { WebSocketServer } from 'ws'
import { Disposable } from 'graphql-ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../container/types'
import { IHttpServerService } from '../http.server/IHttpServer.service'
import { IGraphQLSchemaService } from '../graphql.schema/IGraphQLSchema.service'
import { IWsServerService } from './IWsServer.service'
import { getUserIdFromConnectionParams } from '../../shared/utils/token'
import { InvalidSessionException } from '../../shared/exceptions/invalid.session.exception'


@injectable()
export class WsServerService implements IWsServerService {

    private wsServerDisposable!: Disposable

    constructor(
        @inject(TYPES.IHttpServerService) private readonly _httpServerService: IHttpServerService,
        @inject(TYPES.IGraphQLSchemaService) private readonly _graphQLSchemaService: IGraphQLSchemaService) {
    }

    public initialize() {
        const wsServer = new WebSocketServer({
            server: this._httpServerService.getHttpServer(),
            path: '/api',
        })
        this.wsServerDisposable = useServer({
            schema: this._graphQLSchemaService.getGraphQLSchema(),
            context: async (ctx) => {
                const userId = await getUserIdFromConnectionParams(ctx.connectionParams)
                if (!userId) {
                    throw new InvalidSessionException()
                }
                return { userId }
            },
        }, wsServer)
    }

    public async dispose() {
        await this.wsServerDisposable.dispose()
    }
}