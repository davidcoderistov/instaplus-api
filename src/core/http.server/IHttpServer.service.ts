import { Server } from 'http'


export interface IHttpServerService {
    initialize(): void

    getHttpServer(): Server
}