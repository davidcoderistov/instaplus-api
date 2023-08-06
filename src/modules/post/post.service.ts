import { inject, injectable } from 'inversify'
import { IPostService } from './interfaces/IPost.service'
import { IPostRepository } from './interfaces/IPost.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { IFileRepository } from '../file/IFile.repository'
import { TYPES } from '../../container/types'
import { IHashtag } from './db.models/hashtag.model'
import { IPost } from './db.models/post.model'
import { IPostLike } from './db.models/post-like.model'
import { CreatePostDto } from './dtos'
import { CustomValidationException } from '../../shared/exceptions'
import { FileUpload } from 'graphql-upload-ts'
import _difference from 'lodash/difference'


@injectable()
export class PostService implements IPostService {

    constructor(
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository,
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.IFileRepository) private readonly _fileRepository: IFileRepository) {
    }

    public async createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost> {
        try {
            const creator = await this._userRepository.findUserById(userId)
            if (!creator) {
                return Promise.reject(new CustomValidationException('creatorId', `User ${userId} does not exist`))
            }

            const photoUrls: string[] = []
            const uploads = await createPostDto.photos
            const photos: Promise<FileUpload>[] = uploads.map(photo => new Promise(resolve => {
                resolve(photo)
            }))

            const results = await Promise.allSettled(photos.map(photo =>
                this._fileRepository.storeUpload(photo, '/instaplus/storage/posts', {
                    height: 1080,
                    width: 1080,
                })))

            results.forEach((result: PromiseFulfilledResult<{ photoUrl: string }> | PromiseRejectedResult) => {
                if (result.status === 'fulfilled') {
                    photoUrls.push(result.value.photoUrl)
                } else {
                    throw new CustomValidationException('photoUrl', `Could not upload photo`)
                }
            })

            const post = await this._postRepository.createPost(
                createPostDto,
                photoUrls,
                {
                    _id: creator._id,
                    firstName: creator.firstName,
                    lastName: creator.lastName,
                    username: creator.username,
                    photoUrl: creator.photoUrl,
                },
            )

            const { hashtags = [] } = createPostDto
            if (hashtags.length > 0) {
                const postId = post._id.toString()
                const savedHashtags = await this._postRepository.findHashtagsByNames(hashtags)
                const unsavedHashtagsNames: string[] = _difference(hashtags, savedHashtags.map(hashtag => hashtag.name))
                const unsavedHashtags: IHashtag[] = await Promise.all(
                    unsavedHashtagsNames.map(name => this._postRepository.createHashtag(name, postId)),
                )

                const hashtagIds = [
                    ...savedHashtags.map(hashtag => hashtag._id.toString()),
                    ...unsavedHashtags.map(hashtag => hashtag._id.toString()),
                ]
                await Promise.all(hashtagIds.map(hashtagId => this._postRepository.createHashtagPost(hashtagId, postId)))
            }

            return post
        } catch (err) {
            throw err
        }
    }

    public async findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]> {
        return this._postRepository.findHashtagsBySearchQuery(searchQuery, limit)
    }

    public async likePost(postId: string, userId: string): Promise<IPostLike> {
        try {
            if (!await this._postRepository.findPostById(postId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            if (await this._postRepository.findPostLike(postId, userId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} is already liked`))
            }

            return this._postRepository.createPostLike(postId, userId)
        } catch (err) {
            throw err
        }
    }
}