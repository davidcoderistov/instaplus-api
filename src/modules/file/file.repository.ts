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
        dimensions: { height: number; width: number },
    ): Promise<string> {
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

        // Image processing using Sharp
        const resizedImageBuffer = await sharp(fileBuffer)
            .resize(dimensions.width, dimensions.height)
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

        return result.secure_url
    }
}
