import { inject, injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import { IUserService } from './interfaces/IUser.service'
import { SignUpDto } from './dtos/sign-up.dto'
import { AuthUserModel } from './graphql.models/auth-user.model'
import { TYPES } from '../../container/types'
import bcrypt from 'bcrypt'
import { MongoError } from 'mongodb'
import { Error } from 'mongoose'
import { CustomValidationException } from '../../shared/exceptions/custom.validation.exception'
import { ValidationException } from '../../shared/exceptions/validation.exception'
import { MongodbServerException } from '../../shared/exceptions/mongodb.server.exception'


@injectable()
export class UserService implements IUserService {

    constructor(
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository) {
    }

    public async signUp(signUpDto: SignUpDto): Promise<AuthUserModel> {
        try {
            const passwordHash = await bcrypt.hash(signUpDto.password, 10)
            const user = await this._userRepository.createUser({
                ...signUpDto,
                password: passwordHash,
            })
            return {
                user,
                accessToken: user.accessToken,
            }
        } catch (err) {
            if (err instanceof MongoError) {
                if (err.code === 11000) {
                    throw new CustomValidationException('username', `${signUpDto.username} already exists`)
                }
            } else if (err instanceof Error.ValidationError) {
                throw new ValidationException(err)
            }
            throw new MongodbServerException('Could not sign up. Please try again later')
        }
    }
}