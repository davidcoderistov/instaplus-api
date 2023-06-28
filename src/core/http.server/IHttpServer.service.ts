import { Server } from 'http'
import { Application } from 'express'


export interface IHttpServerService {
    initialize(): void

    getHttpServer(): Server

    getExpressApp(): Application
}