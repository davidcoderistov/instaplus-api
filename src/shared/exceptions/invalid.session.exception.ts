import { GraphQLError } from 'graphql'


export class InvalidSessionException extends GraphQLError {
    constructor() {
        super('Invalid session', {
            extensions: {
                code: 'INVALID_SESSION',
            },
        })
    }
}