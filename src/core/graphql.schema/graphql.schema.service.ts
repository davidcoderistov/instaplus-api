import { GraphQLSchema } from 'graphql'
import { injectable } from 'inversify'
import { IGraphQLSchemaService } from './IGraphQLSchema.service'
import { buildSchema, NonEmptyArray } from 'type-graphql'
import graphqlResolver from '../../modules/graphql.resolver'
import container from '../../container/container'
import { validate } from '../../shared/utils/validation'
import { InvalidArgsException } from '../../shared/exceptions'


@injectable()
export class GraphQLSchemaService implements IGraphQLSchemaService {

    private graphQLSchema!: GraphQLSchema

    public async initialize(): Promise<void> {
        this.graphQLSchema = await buildSchema({
            resolvers: graphqlResolver as unknown as NonEmptyArray<Function>,
            container,
            dateScalarMode: 'timestamp',
            validateFn: async (dtoClass) => {
                const error = await validate(dtoClass)
                if (error) {
                    throw new InvalidArgsException(error)
                }
            },
        })
    }

    public getGraphQLSchema(): GraphQLSchema {
        return this.graphQLSchema
    }
}