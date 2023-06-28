import { GraphQLSchema } from 'graphql'


export interface IGraphQLSchemaService {
    initialize(): Promise<void>

    getGraphQLSchema(): GraphQLSchema
}