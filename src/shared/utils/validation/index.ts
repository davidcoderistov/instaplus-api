import { validate as validateInput, ValidationError } from 'class-validator'


export async function validate(dtoClass: object | undefined): Promise<ValidationError | null> {
    if (dtoClass) {
        const validationErrors = await validateInput(dtoClass)
        return getValidationError(validationErrors)
    }
    return null
}

export function getValidationError(validationErrors: ValidationError[]): ValidationError | null {
    if (validationErrors.length > 0) {
        const error = validationErrors[0]
        if (Array.isArray(error)) {
            return getValidationError(error)
        } else {
            return error
        }
    }
    return null
}