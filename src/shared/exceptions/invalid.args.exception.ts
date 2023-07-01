import { GraphQLError } from 'graphql'
import { ValidationError } from 'class-validator'


function getValidationErrors(error: ValidationError) {
    if (error.constraints) {
        return error.constraints
    } else if (error.children && error.children.length > 0) {
        return getValidationErrors(error.children[0])
    } else {
        return null
    }
}

export class InvalidArgsException extends GraphQLError {
    constructor(error: ValidationError) {
        super('Args validation error', {
            extensions: {
                code: 'ARGS_VALIDATION_FAILED',
                path: error.property,
                errors: getValidationErrors(error),
            },
        })
    }
}