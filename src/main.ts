import 'reflect-metadata'
import { InversifyExpressServer } from 'inversify-express-utils'
import container from './container/container'
import { TYPES } from './container/types'
import { IDatabaseService } from './modules/database/IDatabase.service'
import { json, urlencoded } from 'express'
import cors from 'cors'
import morgan from 'morgan'


(async () => {
    const server = new InversifyExpressServer(container)
    await container.get<IDatabaseService>(TYPES.IDatabaseService).initialize()

    const port = Number(process.env.PORT || 8080)
    server
        .setConfig(app => {
            app.use(morgan('dev'))
            app.use(cors())
            app.use(json())
            app.use(urlencoded({ extended: true }))
        })
        .build()
        .listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
})()