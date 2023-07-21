import { FileUpload } from 'graphql-upload-ts'


export interface IFileRepository {
    storeUpload(upload: Promise<FileUpload>, url: string, dimensions: { height: number, width: number }): Promise<string>
}