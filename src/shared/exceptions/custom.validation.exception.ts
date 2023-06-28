import { GraphQLError } from 'graphql'


export class CustomValidationException extends GraphQLError {
    constructor(path: string, message: string) {
        super('Validation error', {
            extensions: {
                code: 'MONGODB_VALIDATION_FAILED',
                errors: { [path]: message },
            },
        })
    }
}