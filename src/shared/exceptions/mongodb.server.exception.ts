import { GraphQLError } from 'graphql'


export class MongodbServerException extends GraphQLError {
    constructor(message: string) {
        super(message, {
            extensions: {
                code: 'MONGODB_SERVER_ERROR',
            },
        })
    }
}