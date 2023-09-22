import { injectable } from 'inversify'
import { ISeederService } from './ISeeder.service'
import UserModel, { IUser } from '../user/db.models/user.model'
import ChatModel, { IChat } from '../chat/db.models/chat.model'
import MessageModel, { IMessage } from '../chat/db.models/message.model'
import FollowModel, { IFollow } from '../user/db.models/follow.model'
import HashtagModel, { IHashtag } from '../post/db.models/hashtag.model'
import PostModel, { IPost } from '../post/db.models/post.model'
import CommentModel, { IComment } from '../post/db.models/comment.model'
import HashtagPostModel, { IHashtagPost } from '../post/db.models/hashtag-post.model'
import {
    FollowNotification,
    IFollowNotification,
    PostLikeNotification,
    IPostLikeNotification,
    PostCommentNotification,
    IPostCommentNotification,
} from '../notification/db.models/notification.model'
import PostLikeModel, { IPostLike } from '../post/db.models/post-like.model'
import PostSaveModel, { IPostSave } from '../post/db.models/post-save.model'
import CommentLikeModel, { ICommentLike } from '../post/db.models/comment-like.model'
import { v2 as cloudinary } from 'cloudinary'
import { faker } from '@faker-js/faker'
import _range from 'lodash/range'
import _random from 'lodash/random'
import _sample from 'lodash/sample'
import _sampleSize from 'lodash/sampleSize'
import _difference from 'lodash/difference'
import _differenceBy from 'lodash/differenceBy'
import moment from 'moment'


@injectable()
export class SeederService implements ISeederService {

    private static readonly messagePhotoUrls = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707669/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/sqhmwofzz1nnbgzoi3no.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707649/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/xvvzhcqd48radyslse3i.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707582/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/ooqmhmx6pjnvtuuhhmxn.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855693/instaplus/storage/chat/65034f2698179f633a7870b1/ntrj0zsfxs5fm5ietgoq.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855654/instaplus/storage/chat/65034f2698179f633a7870b1/ilpy9szx3bcbp7ogqdje.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855597/instaplus/storage/chat/65034f2698179f633a7870b1/hsgeznw4idfyczv5ozh9.jpg',
    ]

    private static readonly messagePreviewPhotoUrls = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707671/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/q2vpddmm3j2uwj9pahni.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707650/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/sxp4xii6iys84e032yai.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707585/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/kl9cjq1jcyw6nzeleznv.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855694/instaplus/storage/chat/65034f2698179f633a7870b1/yzpu01ujs2fdyg5yyoc1.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855655/instaplus/storage/chat/65034f2698179f633a7870b1/tr1c5v3pux63z178a2cg.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855599/instaplus/storage/chat/65034f2698179f633a7870b1/sjlccodh9v99g2aigaza.jpg',
    ]

    private static readonly hashtags = [
        'Life', 'Joy', 'Happiness', 'Fun', 'Goals', 'Dreams', 'Chill',
        'WonderfulWorld', 'MakeMemories', 'StayPositive', 'DailyInspiration', 'ExploreTheWorld', 'LiveLaughLove', 'EverydayMoments',
        'AdventureTime', 'EnjoyLife', 'GoodTimes', 'Create',
    ]

    private static generateRandomUser(sex: 'male' | 'female'): Pick<IUser, 'firstName' | 'lastName' | 'username' | 'password'> {
        const firstName = faker.person.firstName(sex)
        const lastName = faker.person.lastName(sex)
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
        const password = faker.word.noun({ length: { min: 8, max: 12 } })
        return {
            firstName,
            lastName,
            username,
            password,
        }
    }

    private async generateRandomUsers(): Promise<Omit<IUser, 'password' | 'refreshToken'>[]> {
        const users: Pick<IUser, 'firstName' | 'lastName' | 'username' | 'password' | 'photoUrl'>[] = []

        const uniqueUsernames = new Map<string, boolean>()

        const genRandomUsers = (sex: 'male' | 'female', photoUrls: string[], length: number) => {
            let index = 0
            while (users.length < length) {
                const user = SeederService.generateRandomUser(sex)
                if (!uniqueUsernames.has(user.username)) {
                    uniqueUsernames.set(user.username, true)
                    users.push({
                        ...user,
                        photoUrl: photoUrls.length > 0 ? photoUrls[index] : null,
                    })
                    ++index
                }
            }
        }

        const maleAvatars: string[] = []
        const { resources: malePhotoUrls } = await SeederService.searchCloudinaryByFolder('male_avatars')
        malePhotoUrls.forEach(({ secure_url }) => maleAvatars.push(secure_url))

        const femaleAvatars: string[] = []
        const { resources: femalePhotoUrls } = await SeederService.searchCloudinaryByFolder('female_avatars')
        femalePhotoUrls.forEach(({ secure_url }) => femaleAvatars.push(secure_url))

        genRandomUsers('male', maleAvatars, maleAvatars.length)

        genRandomUsers('female', femaleAvatars, maleAvatars.length + femaleAvatars.length)

        genRandomUsers('male', [], maleAvatars.length + femaleAvatars.length + 8)

        genRandomUsers('female', [], maleAvatars.length + femaleAvatars.length + 16)

        const dbUsers = await UserModel.insertMany(users.map(user => new UserModel(user)))

        return dbUsers.map(user => user.toObject())
    }

    private static getFullUser(user: Omit<IUser, 'password' | 'refreshToken'>): Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'> {
        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
        }
    }

    private static getShortUser(user: Omit<IUser, 'password' | 'refreshToken'>): Pick<IUser, '_id' | 'username' | 'photoUrl'> {
        return {
            _id: user._id,
            username: user.username,
            photoUrl: user.photoUrl,
        }
    }

    private async generateRandomFollowers(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<void> {

        const combinations = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(users, 2)
        let permutations: Omit<IUser, 'password' | 'refreshToken'>[][] = []

        for (const pair of combinations) {
            permutations.push([pair[0], pair[1]])
            permutations.push([pair[1], pair[0]])
        }

        permutations = _sampleSize(permutations, Math.floor(permutations.length * 0.7))

        const follows: (Pick<IFollow, 'followingUserId' | 'followedUserId'> & { createdAt: Date })[] = []
        const followNotifications: (Pick<IFollowNotification, 'type' | 'userId' | 'user'> & { createdAt: Date })[] = []

        permutations.forEach(pair => {
            const followingUserId = pair[0]._id.toString()
            const followedUserId = pair[1]._id.toString()
            const now = moment()
            const createdAt = now.clone().subtract(_random(0, 256000), 'minutes')
            const fourMonthsAgo = now.clone().subtract(4, 'months')

            follows.push({
                followingUserId,
                followedUserId,
                createdAt: createdAt.toDate(),
            })

            if (createdAt.isAfter(fourMonthsAgo)) {
                followNotifications.push({
                    type: 'follow',
                    userId: followedUserId,
                    user: SeederService.getShortUser(pair[0]),
                    createdAt: createdAt.toDate(),
                })
            }
        })

        await FollowModel.insertMany(follows.map(follow => new FollowModel(follow)))
        await FollowNotification.insertMany(followNotifications.map(followNotification => new FollowNotification(followNotification)))
    }

    private async generateRandomChats(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<{ chats: IChat[], top5Users: Omit<IUser, 'password' | 'refreshToken'>[] }> {
        const chats: {
            creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>,
            chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]
        }[] = []

        const top5Users: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(users, 5)

        const generateOneToOneChats = () => {

            const top5UsersIds = top5Users.map(user => user._id.toString())

            const allUserCombinations = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>([
                ...top5Users,
                ...users.filter(user => !top5Users.some(top5User => top5User._id.toString() === user._id.toString())),
            ], 2)
            const top5UserCombinations: Omit<IUser, 'password' | 'refreshToken'>[][] = []

            for (const pair of allUserCombinations) {
                if (top5UsersIds.includes(pair[0]._id.toString()) || top5UsersIds.includes(pair[1]._id.toString())) {
                    top5UserCombinations.push(pair)
                }
            }

            let top5UserCombinationsMax35: Omit<IUser, 'password' | 'refreshToken'>[][] = []

            top5Users.forEach(user => {
                const findIndex = top5UserCombinations.findIndex(pair => pair[0]._id.toString() === user._id.toString())
                if (findIndex >= 0) {
                    top5UserCombinationsMax35 = [...top5UserCombinationsMax35, ...top5UserCombinations.slice(findIndex, findIndex + 35)]
                }
            })

            top5UserCombinationsMax35.forEach(pair => {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 1)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                    ],
                })
            })
        }

        const generateGroupChats = () => {
            const combinations3 = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(top5Users, 3)

            for (const pair of combinations3) {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 2)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                        SeederService.getFullUser(pair[2]),
                    ],
                })
            }

            const combinations4 = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(top5Users, 4)

            for (const pair of combinations4) {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 3)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                        SeederService.getFullUser(pair[2]),
                        SeederService.getFullUser(pair[3]),
                    ],
                })
            }
        }

        generateOneToOneChats()

        generateGroupChats()

        const dbChats = await ChatModel.insertMany(chats.map(chat => new ChatModel(chat)))

        return {
            chats: dbChats.map(chat => chat.toObject()),
            top5Users,
        }
    }

    private async generateRandomMessages(chats: IChat[], min: number, max: number): Promise<void> {

        type IMessageModel = Omit<IMessage, '_id' | 'createdAt'> & { createdAt: Date }

        const messages: IMessageModel[] = []

        const getMessage = ({
                                text = null,
                                photoUrl = null,
                                photoOrientation = null,
                                previewPhotoUrl = null,
                                reply = null,
                                ...rest
                            }: Omit<IMessageModel, 'seenByUserIds' | 'reactions'>): IMessageModel => {
            return {
                text,
                photoUrl,
                photoOrientation,
                previewPhotoUrl,
                reply,
                ...rest,
                seenByUserIds: [rest.creator._id.toString()],
                reactions: [],
            }
        }

        const getRandomCreator = (chat: IChat): Pick<IUser, '_id' | 'username' | 'photoUrl'> => {
            const creator = chat.chatMembers[_random(0, chat.chatMembers.length - 1) as number]
            return { _id: creator._id, username: creator.username, photoUrl: creator.photoUrl }
        }

        chats.forEach(chat => {
            _range(_random(min, max)).forEach(() => {
                messages.push(getMessage({
                    chatId: chat._id.toString(),
                    text: faker.lorem.sentences({ min: 1, max: 4 }),
                    creator: getRandomCreator(chat),
                    createdAt: moment().subtract(_random(0, 86400), 'minutes').toDate(),
                }))
            })
            const photoTotal = _random(1, 3)
            const photoIndices = _sampleSize(_range(SeederService.messagePhotoUrls.length), photoTotal)
            _range(photoTotal).forEach((index) => {
                messages.push(getMessage({
                    chatId: chat._id.toString(),
                    creator: getRandomCreator(chat),
                    photoUrl: SeederService.messagePhotoUrls[photoIndices[index]],
                    previewPhotoUrl: SeederService.messagePreviewPhotoUrls[photoIndices[index]],
                    photoOrientation: 'portrait',
                    createdAt: moment().subtract(_random(0, 86400), 'minutes').toDate(),
                }))
            })
        })

        const dbMessages = await MessageModel.insertMany(messages.map(message => new MessageModel(message))) as unknown as IMessage[]
        const dbMessagesByChat = new Map<string, IMessage[]>()

        dbMessages.forEach(message => {
            const prevMessages = dbMessagesByChat.get(message.chatId) || []
            dbMessagesByChat.set(message.chatId, [...prevMessages, message])
        })

        let randomMessages: IMessage[] = []
        const replyMessages: IMessageModel[] = []

        for (const chatId of dbMessagesByChat.keys()) {
            const messages = dbMessagesByChat.get(chatId)
            if (Array.isArray(messages)) {
                randomMessages = [...randomMessages, ..._sampleSize(messages, _random(3, 5))]
            }
        }

        const chatsMap = new Map<string, IChat>()

        chats.forEach(chat => chatsMap.set(chat._id.toString(), chat))

        randomMessages.forEach(message => {
            const chat = chatsMap.get(message.chatId) as IChat
            const chatMembers = chat.chatMembers.filter(chatMember => chatMember._id.toString() !== message.creator._id.toString())
            const chatMember = _sample(chatMembers) as unknown as Pick<IUser, '_id' | 'username' | 'firstName' | 'lastName' | 'photoUrl'>
            replyMessages.push(getMessage({
                chatId: message.chatId,
                text: faker.lorem.words({ min: 3, max: 6 }),
                creator: {
                    _id: chatMember._id,
                    username: chatMember.username,
                    photoUrl: chatMember.photoUrl,
                },
                reply: {
                    _id: message._id,
                    creator: message.creator,
                    text: message.text,
                    photoUrl: message.photoUrl,
                    photoOrientation: message.photoOrientation,
                    previewPhotoUrl: message.previewPhotoUrl,
                },
                createdAt: moment(message.createdAt as unknown as Date).add(_random(20, 40), 'seconds').toDate(),
            }))
        })

        await MessageModel.insertMany(replyMessages.map(message => new MessageModel(message)))
    }

    private async generateRandomPostsAndHashtags(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<IPost[]> {

        const hashtagDocs = await HashtagModel.insertMany(SeederService.hashtags.map(name => new HashtagModel({ name })))
        const hashtags: IHashtag[] = hashtagDocs.map(hashtag => hashtag.toObject())
        const hashtagsByName = new Map<string, IHashtag>()

        hashtags.forEach(hashtag => hashtagsByName.set(hashtag.name, hashtag))

        let photoUrls = await this.fetchPostsPhotoUrls()
        let postsPhotoUrls: string[][] = []

        let doubleTotal = Math.floor(photoUrls.length * 0.2)
        if (doubleTotal % 2 !== 0) {
            doubleTotal -= 1
        }

        if (doubleTotal > 0) {
            const randomPhotoUrls: string[] = _sampleSize(photoUrls, doubleTotal)
            photoUrls = _difference(photoUrls, randomPhotoUrls)
            for (let i = 0; i < randomPhotoUrls.length / 2; ++i) {
                postsPhotoUrls.push([
                    randomPhotoUrls[i],
                    randomPhotoUrls[randomPhotoUrls.length - i - 1],
                ])
            }
        }

        postsPhotoUrls = [
            ...postsPhotoUrls,
            ...photoUrls.map(photoUrl => [photoUrl]),
        ]

        const avg = Math.floor(postsPhotoUrls.length / users.length)
        const stdDeviation = Math.floor(avg * 0.6)
        const min = avg - stdDeviation

        const postsPromises: Promise<IPost>[] = []
        const hashtagPosts: Pick<IHashtagPost, 'hashtagId' | 'postId'>[] = []

        const generateRandomPost = async (user: Omit<IUser, 'password' | 'refreshToken'>, photoUrls: string[]): Promise<IPost> => {

            let hashtags: string[] = []
            let caption: string | null = null

            if (_random(1, 5) > 1) {
                if (_random(1, 4) > 3) {
                    caption = faker.lorem.sentences({ min: 1, max: 4 })
                }

                hashtags = _sampleSize(SeederService.hashtags, _random(3, 8))
                let hashtagsDesc = hashtags.map(hashtag => `#${hashtag}`).join(' ')

                if (caption) {
                    caption = `${caption} ${hashtagsDesc}`
                } else {
                    caption = hashtagsDesc
                }
            }

            const post = new PostModel({
                caption,
                location: _random(1, 2) > 1 ? faker.location.city() : null,
                photoUrls,
                creator: SeederService.getFullUser(user),
                commentsCount: 0,
                createdAt: moment().subtract(_random(0, 604800), 'minutes').toDate(),
            })

            await post.save()

            const p: IPost = post.toObject()

            hashtags.forEach(name => {
                const hashtag = hashtagsByName.get(name)
                if (hashtag) {
                    hashtagPosts.push({
                        hashtagId: hashtag._id.toString(),
                        postId: p._id.toString(),
                    })
                }
            })

            return p
        }

        users.forEach(user => {
            _range(min).forEach(() => {
                postsPromises.push(generateRandomPost(user, postsPhotoUrls[0]))
                postsPhotoUrls.shift()
            })
        })

        postsPhotoUrls.forEach(photoUrls => postsPromises.push(generateRandomPost(_sample(users) as Omit<IUser, 'password' | 'refreshToken'>, photoUrls)))

        const posts = await Promise.all(postsPromises)

        if (hashtagPosts.length > 0) {
            await HashtagPostModel.insertMany(hashtagPosts.map(hashtagPost => new HashtagPostModel(hashtagPost)))
        }

        return posts
    }

    private async generateRandomComments(users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[]): Promise<IComment[]> {

        const comments: (Pick<IComment, 'text' | 'postId' | 'creator'> & { createdAt: Date })[] = []
        const notifications: (Pick<IPostCommentNotification, 'userId' | 'post' | 'type' | 'user'> & { createdAt: Date })[] = []

        const allUsers = [...users, ...users, ...users, ...users, ...users]
        const percentages = [0.05, 0.25, 0.4, 0.25, 0.05]
        const weight = [
            { min: 0, max: 0 },
            { min: 10, max: 20 },
            { min: 40, max: 80 },
            { min: 85, max: 105 },
            { min: 400, max: 500 },
        ]

        SeederService.splitArrayByPercentages(posts, percentages, '_id').forEach((posts: IPost[], index) => {
            if (index > 0) {
                const { min, max } = weight[index]
                posts.forEach(post => {
                    const creators: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(index > 3 ? allUsers : users, _random(min, max))
                    creators.forEach(creator => {
                        const fourMonthsAgo = moment().subtract(4, 'months')
                        const createdAt = SeederService.getRandomDateStartingFrom(post.createdAt as unknown as Date)

                        comments.push({
                            text: faker.lorem.sentences({ min: 1, max: 4 }),
                            postId: post._id.toString(),
                            creator: SeederService.getShortUser(creator),
                            createdAt,
                        })

                        if (moment(createdAt).isAfter(fourMonthsAgo)) {
                            notifications.push({
                                type: 'comment',
                                post: {
                                    _id: post._id,
                                    photoUrls: post.photoUrls,
                                },
                                userId: post.creator._id.toString(),
                                user: SeederService.getShortUser(creator),
                                createdAt,
                            })
                        }
                    })
                })
            }
        })

        const dbCommentsDocs = await CommentModel.insertMany(comments.map(comment => new CommentModel(comment)))
        const dbComments: IComment[] = dbCommentsDocs.map(comment => comment.toObject())

        await PostCommentNotification.insertMany(notifications.map(notification => new PostCommentNotification(notification)))

        const dbCommentsByPost = new Map<string, IComment[]>()
        dbComments.forEach(comment => {
            const comments = dbCommentsByPost.get(comment.postId)
            dbCommentsByPost.set(comment.postId, Array.isArray(comments) ? [...comments, comment] : [comment])
        })

        const postsMap = new Map<string, IPost>()
        posts.forEach(post => postsMap.set(post._id.toString(), post))

        const replyComments: (Pick<IComment, 'text' | 'postId' | 'creator' | 'commentId'> & { createdAt: Date })[] = []
        const replyNotifications: (Pick<IPostCommentNotification, 'userId' | 'post' | 'type' | 'user'> & { createdAt: Date })[] = []

        for (const postId of dbCommentsByPost.keys()) {
            const comments = dbCommentsByPost.get(postId) as IComment[]
            const randomComments: IComment[] = _sampleSize(comments, _random(1, 3))

            randomComments.forEach(comment => {

                const post = postsMap.get(postId) as IPost
                const creators: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(users, _random(3, 12))

                creators.forEach(creator => {
                    const createdAt = SeederService.getRandomDateStartingFrom(comment.createdAt as unknown as Date)

                    replyComments.push({
                        text: faker.lorem.sentences({ min: 1, max: 3 }),
                        postId: post._id.toString(),
                        creator: SeederService.getShortUser(creator),
                        commentId: comment._id.toString(),
                        createdAt,
                    })

                    replyNotifications.push({
                        type: 'comment',
                        post: {
                            _id: post._id,
                            photoUrls: post.photoUrls,
                        },
                        userId: post.creator._id.toString(),
                        user: SeederService.getShortUser(creator),
                        createdAt,
                    })
                })
            })
        }

        const dbReplyCommentsDocs = await CommentModel.insertMany(replyComments.map(comment => new CommentModel(comment)))
        const dbReplyComments: IComment[] = dbReplyCommentsDocs.map(comment => comment.toObject())

        await PostCommentNotification.insertMany(replyNotifications.map(notification => new PostCommentNotification(notification)))

        return [
            ...dbComments,
            ...dbReplyComments,
        ]
    }

    private async batchGenerateRandomComments(users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[], batchSize: number = 1000): Promise<IComment[]> {

        const comments: IComment[] = []

        let startIndex = 0
        while (startIndex < posts.length) {
            const batch = posts.slice(startIndex, startIndex + batchSize)
            const generatedComments = await this.generateRandomComments(users, batch)
            comments.push(...generatedComments)
            startIndex += batchSize
        }

        return comments
    }

    private async likeComments(users: Omit<IUser, 'password' | 'refreshToken'>[], comments: IComment[]): Promise<void> {

        const likes: (Pick<ICommentLike, 'userId' | 'commentId'> & { createdAt: Date })[] = []

        const createCommentLikes = (comments: IComment[], min: number, max: number) => {
            comments.forEach(comment => {
                const u = users.filter(user => user._id.toString() !== comment.creator._id.toString())
                const likingUsers: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(u, _random(min, max))
                likingUsers.forEach(user => {
                    likes.push({
                        commentId: comment._id.toString(),
                        userId: user._id.toString(),
                        createdAt: SeederService.getRandomDateStartingFrom(comment.createdAt as unknown as Date),
                    })
                })
            })
        }

        const commentsByPost = new Map<string, IComment[]>()
        comments.forEach(comment => {
            const comments = commentsByPost.get(comment.postId)
            commentsByPost.set(comment.postId, Array.isArray(comments) ? [...comments, comment] : [comment])
        })

        for (const postId of commentsByPost.keys()) {
            const comments = commentsByPost.get(postId) as IComment[]

            const normalComments = comments.filter(comment => Boolean(!comment.commentId))
            const replyComments = comments.filter(comment => Boolean(comment.commentId))

            const percentages = [0.15, 0.4, 0.3, 0.15]
            const weight = [{ min: 0, max: 0 }, { min: 2, max: 4 }, { min: 5, max: 8 }, { min: 15, max: 25 }]

            SeederService.splitArrayByPercentages(normalComments, percentages, '_id').forEach((comments: IComment[], index) => {
                if (index > 0) {
                    const { min, max } = weight[index]
                    createCommentLikes(comments, min, max)
                }
            })

            SeederService.splitArrayByPercentages(replyComments, percentages, '_id').forEach((comments: IComment[], index) => {
                if (index > 0) {
                    const { min, max } = weight[index]
                    createCommentLikes(comments, min, max)
                }
            })
        }

        await CommentLikeModel.insertMany(likes.map(like => new CommentLikeModel(like)))
    }

    private async batchLikeComments(users: Omit<IUser, 'password' | 'refreshToken'>[], comments: IComment[], batchSize: number = 1000): Promise<void> {

        let startIndex = 0
        while (startIndex < comments.length) {
            const batch = comments.slice(startIndex, startIndex + batchSize)
            await this.likeComments(users, batch)
            startIndex += batchSize
        }
    }

    private async likePosts(users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[]): Promise<void> {

        const likes: (Pick<IPostLike, 'userId' | 'postId'> & { createdAt: Date })[] = []
        const notifications: (Pick<IPostLikeNotification, 'userId' | 'post' | 'type' | 'user'> & { createdAt: Date })[] = []

        const likePost = (user: Omit<IUser, 'password' | 'refreshToken'>, post: IPost) => {
            const fourMonthsAgo = moment().subtract(4, 'months')
            const createdAt = SeederService.getRandomDateStartingFrom(post.createdAt as unknown as Date)

            likes.push({
                postId: post._id.toString(),
                userId: user._id.toString(),
                createdAt,
            })

            if (moment(createdAt).isAfter(fourMonthsAgo)) {
                notifications.push({
                    type: 'like',
                    post: {
                        _id: post._id,
                        photoUrls: post.photoUrls,
                    },
                    userId: post.creator._id.toString(),
                    user: SeederService.getShortUser(user),
                    createdAt,
                })
            }
        }

        const percentages = [0.1, 0.25, 0.4, 0.2, 0.05]
        const weight = [
            { min: 0, max: 0 },
            { min: 15, max: 25 },
            { min: 30, max: 40 },
            { min: 50, max: 60 },
            { min: 80, max: 100 },
        ]

        SeederService.splitArrayByPercentages(posts, percentages, '_id').forEach((posts: IPost[], index) => {
            if (index > 0) {
                const { min, max } = weight[index]
                posts.forEach(post => {
                    const u = users.filter(user => user._id.toString() !== post.creator._id.toString())
                    const likingUsers: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(u, _random(min, max))
                    likingUsers.forEach(user => {
                        likePost(user, post)
                    })
                })
            }
        })

        await PostLikeModel.insertMany(likes.map(like => new PostLikeModel(like)))
        await PostLikeNotification.insertMany(notifications.map(notification => new PostLikeNotification(notification)))
    }

    private async batchLikePosts(users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[], batchSize: number = 1000): Promise<void> {

        let startIndex = 0
        while (startIndex < posts.length) {
            const batch = posts.slice(startIndex, startIndex + batchSize)
            await this.likePosts(users, batch)
            startIndex += batchSize
        }
    }

    private async savePosts(top5Users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[], percentageSaved: number): Promise<void> {

        const saves: (Pick<IPostSave, 'userId' | 'postId'> & { createdAt: Date })[] = []

        const savePost = (user: Omit<IUser, 'password' | 'refreshToken'>, post: IPost) => {
            saves.push({
                postId: post._id.toString(),
                userId: user._id.toString(),
                createdAt: SeederService.getRandomDateStartingFrom(post.createdAt as unknown as Date),
            })
        }

        top5Users.forEach(user => {
            const p = posts.filter(post => post.creator._id.toString() !== user._id.toString())
            const postsToBeSaved: IPost[] = _sampleSize(
                p,
                Math.floor(p.length * percentageSaved / 100),
            )
            postsToBeSaved.forEach(post => {
                savePost(user, post)
            })
        })

        await PostSaveModel.insertMany(saves.map(save => new PostSaveModel(save)))
    }

    private async updateHashtagsPostsCounts(): Promise<void> {

        const postsCountsByHashtag: { _id: string, postsCount: number }[] = await HashtagPostModel.aggregate([
            {
                $group: {
                    _id: '$hashtagId',
                    postsCount: { $sum: 1 },
                },
            },
        ])

        await Promise.all(postsCountsByHashtag.map(({ _id, postsCount }) =>
            HashtagModel.findByIdAndUpdate(_id, { $set: { postsCount } }, { new: true, lean: true })))
    }

    private async updatePostsCommentsCounts(offset: number, limit: number): Promise<void> {

        const commentsCountsByPosts: { _id: string, commentsCount: number }[] = await CommentModel.aggregate([
            {
                $match: { commentId: { $eq: null } },
            },
            {
                $group: {
                    _id: '$postId',
                    commentsCount: { $sum: 1 },
                },
            },
            {
                $sort: { createdAt: -1, _id: -1 },
            },
            {
                $skip: offset,
            },
            {
                $limit: limit,
            },
        ])

        await Promise.all(commentsCountsByPosts.map(({ _id, commentsCount }) =>
            PostModel.findByIdAndUpdate(_id, { $inc: { commentsCount } }, { new: true, lean: true })))
    }

    private async batchUpdatePostsCommentsCounts(batchSize: number = 5000): Promise<void> {

        const commentsCount = await CommentModel.find({ commentId: { $eq: null } }).count()

        let startIndex = 0
        while (startIndex < commentsCount) {
            await this.updatePostsCommentsCounts(startIndex, batchSize)
            startIndex += batchSize
        }
    }

    private static getRandomDateStartingFrom(startDate: Date): Date {
        const start = moment(startDate)
        const end = moment()

        const diffInMs = end.diff(start)
        return start.clone().add(_random(0, diffInMs), 'milliseconds').toDate()
    }

    private static splitArrayByPercentages(arr: any[], percentages: number[], compareBy: string | null = null): any[][] {

        const result: any[][] = []
        let remaining: any[] = Array.from(arr)

        for (const percentage of percentages) {
            const size = Math.floor(arr.length * percentage)
            const sample: any[] = _sampleSize(remaining, size)
            result.push(sample)
            if (compareBy) {
                remaining = _differenceBy(remaining, sample, compareBy)
            } else {
                remaining = _difference(remaining, sample)
            }
        }

        return result
    }

    private async fetchPostsPhotoUrls(): Promise<string[]> {

        const photoUrls: string[] = []
        let next_cursor: string | null = null

        do {
            const result = await SeederService.searchCloudinaryByFolder('posts', next_cursor)
            next_cursor = result.next_cursor
            result.resources.forEach(({ secure_url }) => photoUrls.push(secure_url))
        } while (Boolean(next_cursor))

        return photoUrls
    }

    private static async searchCloudinaryByFolder(folder: string, nextCursor: string | null = null): Promise<{
        next_cursor: string | null
        resources: { secure_url: string }[]
    }> {
        const expression = `folder=${folder}`

        if (nextCursor) {
            return cloudinary.search
                .expression(expression)
                .max_results(500)
                .next_cursor(nextCursor)
                .execute()
        }
        return cloudinary.search
            .expression(expression)
            .max_results(500)
            .execute()
    }

    private* combinationN<T>(array: T[], n: number): Generator<T[]> {
        if (n === 1) {
            for (const a of array) {
                yield [a]
            }
            return
        }

        for (let i = 0; i <= array.length - n; i++) {
            for (const c of this.combinationN(array.slice(i + 1), n - 1)) {
                yield [array[i], ...c]
            }
        }
    }

    private static getTimeElapsed(start: moment.Moment, end: moment.Moment) {
        const diffInSeconds = end.diff(start, 'seconds')

        const minutes = Math.floor(diffInSeconds / 60)
        const seconds = diffInSeconds % 60

        return minutes > 0 ? seconds > 0 ? `${minutes} minutes and ${seconds} seconds.` : `${minutes} minutes.` : `${seconds} seconds.`
    }

    async seed(): Promise<void> {

        const start = moment()

        console.log('GENERATING RANDOM USERS...')
        const users = await this.generateRandomUsers()
        const endUsers = moment()
        console.log(`GENERATING RANDOM USERS...DONE in ${SeederService.getTimeElapsed(start, endUsers)}`)

        console.log('GENERATING RANDOM FOLLOWERS...')
        await this.generateRandomFollowers(users)
        const endFollowers = moment()
        console.log(`GENERATING RANDOM FOLLOWERS...DONE in ${SeederService.getTimeElapsed(endUsers, endFollowers)}`)

        console.log('GENERATING RANDOM CHATS...')
        const { chats, top5Users } = await this.generateRandomChats(users)
        const endChats = moment()
        console.log(`GENERATING RANDOM CHATS...DONE in ${SeederService.getTimeElapsed(endFollowers, endChats)}`)

        console.log('GENERATING RANDOM MESSAGES...')
        await this.generateRandomMessages(chats, 3, 33)
        const endMessages = moment()
        console.log(`GENERATING RANDOM MESSAGES...DONE in ${SeederService.getTimeElapsed(endChats, endMessages)}`)

        console.log('GENERATING RANDOM POSTS...')
        const posts = await this.generateRandomPostsAndHashtags(users)
        const endPosts = moment()
        console.log(`GENERATING RANDOM POSTS...DONE in ${SeederService.getTimeElapsed(endMessages, endPosts)}`)

        console.log('GENERATING RANDOM POST LIKES...')
        await this.batchLikePosts(users, posts)
        const endLikePosts = moment()
        console.log(`GENERATING RANDOM POST LIKES...DONE in ${SeederService.getTimeElapsed(endPosts, endLikePosts)}`)

        console.log('GENERATING RANDOM POST SAVES...')
        await this.savePosts(top5Users, posts, 1)
        const endSavePosts = moment()
        console.log(`GENERATING RANDOM POST SAVES...DONE in ${SeederService.getTimeElapsed(endLikePosts, endSavePosts)}`)

        console.log('GENERATING RANDOM COMMENTS...')
        const comments = await this.batchGenerateRandomComments(users, posts)
        const endComments = moment()
        console.log(`GENERATING RANDOM COMMENTS...DONE in ${SeederService.getTimeElapsed(endSavePosts, endComments)}`)

        console.log('GENERATING RANDOM COMMENT LIKES...')
        await this.batchLikeComments(users, comments)
        const endLikeComments = moment()
        console.log(`GENERATING RANDOM COMMENT LIKES...DONE in ${SeederService.getTimeElapsed(endComments, endLikeComments)}`)

        console.log('UPDATING HASHTAGS POSTS COUNTS...')
        await this.updateHashtagsPostsCounts()
        const endUpdateHashtagsPostsCounts = moment()
        console.log(`UPDATING HASHTAGS POSTS COUNTS...DONE in ${SeederService.getTimeElapsed(endLikeComments, endUpdateHashtagsPostsCounts)}`)

        console.log('UPDATING POSTS COMMENTS COUNTS...')
        await this.batchUpdatePostsCommentsCounts()
        const endUpdatePostsCommentsCounts = moment()
        console.log(`UPDATING POSTS COMMENTS COUNTS...DONE in ${SeederService.getTimeElapsed(endUpdateHashtagsPostsCounts, endUpdatePostsCommentsCounts)}`)

        console.log(`Seeding done in ${SeederService.getTimeElapsed(start, endUpdatePostsCommentsCounts)}`)

        console.log(`Top 5 users are: ${top5Users.map(user => user.username).join(', ')}`)
    }
}