import { injectable } from 'inversify'
import { ICloudinaryService } from './ICloudinary.service'
import { v2 as cloudinary } from 'cloudinary'


@injectable()
export class CloudinaryService implements ICloudinaryService {

    public async initialize() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET,
            secure: true,
        })
    }
}