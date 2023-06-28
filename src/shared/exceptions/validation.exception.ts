import { GraphQLError } from 'graphql'
import { Error } from 'mongoose'


interface ValidationErrors {
    [path: string]: string
}

function getValidationErrors(err: Error.ValidationError): ValidationErrors {
    return Object.values(err.errors).reduce((errors, err) => {
        if (err instanceof Error.ValidatorError) {
            return {
                ...errors,
                [err.path]: err.properties.message,
            }
        }
        return errors
    }, {})
}

export class ValidationException extends GraphQLError {
    constructor(err: Error.ValidationError) {
        const errors = getValidationErrors(err)
        super('Validation error', {
            extensions: {
                code: 'MONGODB_VALIDATION_FAILED',
                errors,
            },
        })
    }
}