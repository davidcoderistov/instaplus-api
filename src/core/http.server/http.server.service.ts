import http, { Server } from 'http'
import { injectable } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import container from '../../container/container'
import { IHttpServerService } from './IHttpServer.service'
import morgan from 'morgan'
import cors from 'cors'
import { json, urlencoded } from 'express'


@injectable()
export class HttpServerService implements IHttpServerService {

    private httpServer!: Server

    public initialize() {
        const server = new InversifyExpressServer(container)

        this.httpServer = http.createServer(server.setConfig(app => {
            app.use(morgan('dev'))
            app.use(cors())
            app.use(json())
            app.use(urlencoded({ extended: true }))
        }).build())
    }

    public getHttpServer(): Server {
        return this.httpServer
    }
}