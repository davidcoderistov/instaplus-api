import { injectable } from 'inversify'
import { IFileRepository } from './IFile.repository'
import { FileUpload } from 'graphql-upload-ts'
import { createWriteStream, unlink } from 'fs'
import path from 'path'
import { promisify } from 'util'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'

const unlinkAsync = promisify(unlink)

@injectable()
export class FileRepository implements IFileRepository {

    public async storeUpload(
        upload: Promise<FileUpload>,
        url: string,
        dimensions?: { height: number; width: number },
    ): Promise<{ photoUrl: string, photoOrientation: 'landscape' | 'portrait' }> {
        const { createReadStream, filename } = await upload
        const stream = createReadStream()
        const storedFileUrl = path.join(__dirname, '..', path.join('/', `${new Date().getTime()}-${filename}`))

        const chunks = []

        // Push each chunk of data into the 'chunks' array
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk))
        }

        // Concatenate the chunks into a single buffer
        const fileBuffer = Buffer.concat(chunks)

        // Get image dimensions
        let width, height
        if (dimensions) {
            width = dimensions.width
            height = dimensions.height
        } else {
            const dimensions = await sharp(fileBuffer).metadata()
            if (dimensions.width && dimensions.height) {
                if (dimensions.width - 200 > dimensions.height) {
                    width = 600
                    height = 400
                } else {
                    width = 320
                    height = 480
                }
            } else {
                width = 320
                height = 480
            }
        }
        const photoOrientation = width > height ? 'landscape' : 'portrait'


        // Image processing using Sharp
        const resizedImageBuffer = await sharp(fileBuffer)
            .resize(width, height)
            .toBuffer()

        await new Promise((resolve, reject) => {
            const writeStream = createWriteStream(storedFileUrl)

            writeStream.on('finish', resolve)
            writeStream.on('error', (error) => {
                unlinkAsync(storedFileUrl).then(() => {
                    reject(error)
                })
            })

            writeStream.write(resizedImageBuffer)
            writeStream.end()
        })

        const result = await cloudinary.uploader.upload(storedFileUrl, { folder: url })
        await unlinkAsync(storedFileUrl)

        return {
            photoUrl: result.secure_url,
            photoOrientation,
        }
    }
}
