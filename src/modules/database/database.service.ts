import { injectable } from 'inversify'
import { IDatabaseService } from './IDatabase.service'
import mongoose from 'mongoose'


@injectable()
export class DatabaseService implements IDatabaseService {

    public async initialize() {
        try {
            const connection = await mongoose.connect(process.env.MONGO_URI)
            console.log(`MongoDB Connected: ${connection.connection?.host}`)
        } catch (err) {
            console.error(err)
        }
    }
}