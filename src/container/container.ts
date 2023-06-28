import { Container } from 'inversify'
import { bindings } from './inversify.config'
import '../modules/graphql.controller'


const container = new Container({ defaultScope: 'Singleton' })

container.load(bindings)

export default container