import { ContainerModule } from 'inversify'
import { TYPES } from './types'
import { IDatabaseService } from '../modules/database/IDatabase.service'
import { DatabaseService } from '../modules/database/database.service'


export const bindings = new ContainerModule(bind => {
    bind<IDatabaseService>(TYPES.IDatabaseService).to(DatabaseService)
})