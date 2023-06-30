import { Schema, Types, model } from 'mongoose'


const UserSchema = new Schema({
    username: {
        type: Schema.Types.String,
        required: [true, 'Username is required'],
        unique: true,
    },
    firstName: {
        type: Schema.Types.String,
        required: [true, 'First name is required'],
    },
    lastName: {
        type: Schema.Types.String,
        required: [true, 'Last name is required'],
    },
    photoUrl: {
        type: Schema.Types.String,
        required: [true, 'Photo url is required'],
    },
    password: {
        type: Schema.Types.String,
        required: [true, 'Password is required'],
    },
    accessToken: Schema.Types.String,
    refreshToken: Schema.Types.String,
})

export interface IUser {
    _id: Types.ObjectId
    username: string
    firstName: string
    lastName: string
    photoUrl: string
    password: string
    accessToken?: string | null
    refreshToken?: string | null
}

export default model('User', UserSchema)