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
    password: {
        type: Schema.Types.String,
        required: [true, 'Password is required'],
    },
    photoUrl: Schema.Types.String,
    accessToken: Schema.Types.String,
    refreshToken: Schema.Types.String,
})

UserSchema.index({ firstName: 1, lastName: 1, username: 1 })

export interface IUser {
    _id: Types.ObjectId
    username: string
    firstName: string
    lastName: string
    photoUrl: string | null
    password: string
    accessToken?: string | null
    refreshToken?: string | null
}

export default model('User', UserSchema)