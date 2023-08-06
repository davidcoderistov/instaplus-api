import { injectable } from 'inversify'
import { IFileRepository } from './IFile.repository'
import { FileUpload } from 'graphql-upload-ts'
import { ReadStream } from 'fs'
import { Readable } from 'stream'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'
import { MongodbServerException } from '../../shared/exceptions'


@injectable()
export class FileRepository implements IFileRepository {

    public async storeUpload(
        upload: Promise<FileUpload>,
        url: string,
        dimensions?: { height: number; width: number },
    ): Promise<{ photoUrl: string, photoOrientation: 'landscape' | 'portrait' }> {
        const { createReadStream } = await upload
        const stream = createReadStream()

        const buffer = await FileRepository.bufferFromStream(stream)

        return this.storeImage(buffer, url, dimensions)
    }

    public async storePreviewUpload(
        upload: Promise<FileUpload>,
        url: string,
        dimensions?: { height: number; width: number },
    ): Promise<{ photoUrl: string, photoOrientation: 'landscape' | 'portrait', previewPhotoUrl: string }> {
        const { createReadStream } = await upload
        const stream = createReadStream()

        const buffer = await FileRepository.bufferFromStream(stream)

        const [photo, previewPhoto]: (PromiseFulfilledResult<{ photoUrl: string, photoOrientation: 'landscape' | 'portrait' }> | PromiseRejectedResult)[] =
            await Promise.allSettled([
                this.storeImage(buffer, url, dimensions),
                this.storeImage(buffer, url, { height: 1080, width: 1080 }),
            ])

        if (photo.status === 'fulfilled' && previewPhoto.status === 'fulfilled') {
            return {
                photoUrl: photo.value.photoUrl,
                photoOrientation: photo.value.photoOrientation,
                previewPhotoUrl: previewPhoto.value.photoUrl,
            }
        } else {
            return Promise.reject(new MongodbServerException('Could not upload image'))
        }
    }

    private async storeImage(
        buffer: Buffer,
        url: string,
        dimensions?: { height: number; width: number },
    ): Promise<{ photoUrl: string, photoOrientation: 'landscape' | 'portrait' }> {
        // Get image dimensions
        let width, height
        if (dimensions) {
            width = dimensions.width
            height = dimensions.height
        } else {
            const dimensions = await sharp(buffer).metadata()
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
        const resizedImageBuffer = await sharp(buffer)
            .resize(width, height)
            .toBuffer()

        const { secure_url: photoUrl }: { secure_url: string } = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: url }, (err, res) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(err)
                }
            })
            FileRepository.bufferToStream(resizedImageBuffer).pipe(stream)
        })

        return {
            photoUrl,
            photoOrientation,
        }
    }

    private static async bufferFromStream(stream: ReadStream): Promise<Buffer> {
        const chunks = []

        // Push each chunk of data into the 'chunks' array
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk))
        }

        // Concatenate the chunks into a single buffer
        return Buffer.concat(chunks)
    }

    private static bufferToStream(buffer: Buffer) {
        return new Readable({
            read() {
                this.push(buffer)
                this.push(null)
            },
        })
    }
}
