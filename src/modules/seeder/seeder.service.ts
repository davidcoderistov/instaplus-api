import { injectable } from 'inversify'
import { ISeederService } from './ISeeder.service'
import UserModel, { IUser } from '../user/db.models/user.model'
import ChatModel, { IChat } from '../chat/db.models/chat.model'
import MessageModel, { IMessage } from '../chat/db.models/message.model'
import FollowModel, { IFollow } from '../user/db.models/follow.model'
import HashtagModel, { IHashtag } from '../post/db.models/hashtag.model'
import PostModel, { IPost } from '../post/db.models/post.model'
import HashtagPostModel, { IHashtagPost } from '../post/db.models/hashtag-post.model'
import {
    FollowNotification,
    IFollowNotification,
    PostLikeNotification,
    IPostLikeNotification,
} from '../notification/db.models/notification.model'
import PostLikeModel, { IPostLike } from '../post/db.models/post-like.model'
import { v2 as cloudinary } from 'cloudinary'
import { faker } from '@faker-js/faker'
import _range from 'lodash/range'
import _random from 'lodash/random'
import _sample from 'lodash/sample'
import _sampleSize from 'lodash/sampleSize'
import _difference from 'lodash/difference'
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

        permutations = _sampleSize(permutations, Math.floor(permutations.length / 5))

        const follows: (Pick<IFollow, 'followingUserId' | 'followedUserId'> & { createdAt: Date })[] = []
        const followNotifications: (Pick<IFollowNotification, 'type' | 'userId' | 'user'> & { createdAt: Date })[] = []

        permutations.forEach(pair => {
            const followingUserId = pair[0]._id.toString()
            const followedUserId = pair[1]._id.toString()
            const createdAt = moment().subtract(_random(0, 256000), 'minutes').toDate()

            follows.push({
                followingUserId,
                followedUserId,
                createdAt,
            })

            followNotifications.push({
                type: 'follow',
                userId: followedUserId,
                user: SeederService.getShortUser(pair[0]),
                createdAt,
            })
        })

        await FollowModel.insertMany(follows.map(follow => new FollowModel(follow)))
        await FollowNotification.insertMany(followNotifications.map(followNotification => new FollowNotification(followNotification)))
    }

    private async generateRandomChats(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<IChat[]> {
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

        return dbChats.map(chat => chat.toObject())
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

    private async likePosts(users: Omit<IUser, 'password' | 'refreshToken'>[], posts: IPost[], percentageNotLiked: number): Promise<void> {

        const likes: (Pick<IPostLike, 'userId' | 'postId'> & { createdAt: Date })[] = []
        const notifications: (Pick<IPostLikeNotification, 'userId' | 'post' | 'type' | 'user'> & { createdAt: Date })[] = []

        const likePost = (user: Omit<IUser, 'password' | 'refreshToken'>, post: IPost) => {
            const now = moment()
            const postCreatedAt = moment(post.createdAt as unknown as Date)
            const randomDate = now.clone().subtract(_random(0, postCreatedAt.clone().add(2, 'hours').minutes()), 'minutes')
            const createdAt = randomDate.isAfter(now) ? now.toDate() : randomDate.toDate()

            likes.push({
                postId: post._id.toString(),
                userId: user._id.toString(),
                createdAt,
            })

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

        const postsToBeLiked: IPost[] = _sampleSize(posts, Math.ceil(posts.length * (100 - percentageNotLiked) / 100))

        postsToBeLiked.forEach(post => {
            const u = users.filter(user => user._id.toString() !== post.creator._id.toString())
            const likingUsers: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(u, _random(Math.floor(u.length * 0.25), Math.floor(u.length * 0.75)))
            likingUsers.forEach(user => {
                likePost(user, post)
            })
        })

        await PostLikeModel.insertMany(likes.map(like => new PostLikeModel(like)))
        await PostLikeNotification.insertMany(notifications.map(notification => new PostLikeNotification(notification)))
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

    async seed(): Promise<void> {
        console.log('GENERATING RANDOM USERS...')

        const users = await this.generateRandomUsers()

        const chats = await this.generateRandomChats(users)

        console.log('GENERATING RANDOM USERS...DONE')
    }
}