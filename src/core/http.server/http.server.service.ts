import http, { Server } from 'http'
import { Application } from 'express'
import { injectable } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import container from '../../container/container'
import { IHttpServerService } from './IHttpServer.service'
import morgan from 'morgan'
import cors from 'cors'
import { json } from 'body-parser'


@injectable()
export class HttpServerService implements IHttpServerService {

    private httpServer!: Server

    private expressApp!: Application

    public initialize() {
        const server = new InversifyExpressServer(container)

        this.httpServer = http.createServer(server.setConfig(app => {
            app.use('/api',
                morgan('dev'),
                cors({ origin: 'http://localhost:3000', credentials: true }),
                json(),
            )
            this.expressApp = app
        }).build())
    }

    public getHttpServer(): Server {
        return this.httpServer
    }

    public getExpressApp(): Application {
        return this.expressApp
    }
}