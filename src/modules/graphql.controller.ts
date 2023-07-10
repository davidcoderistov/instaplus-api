import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, httpGet } from 'inversify-express-utils'
import { TYPES } from '../container/types'
import { IChatRepository } from './chat/interfaces/IChat.repository'
import { generateAccessToken } from '../shared/utils/token'
import { IUserService } from './user/interfaces/IUser.service'
import { IChatService } from './chat/interfaces/IChat.service'


@controller('/api')
export class GraphQLController {

    constructor(@inject(TYPES.IChatRepository) private readonly _chatRepository: IChatRepository,
                @inject(TYPES.IUserService) private readonly _userService: IUserService,
                @inject(TYPES.IChatService) private readonly _chatService: IChatService) {
    }

    @httpGet('/chats')
    public async getChatsWithLatestMessages(req: Request, res: Response) {
        const c = await this._chatRepository.findChatsForUser('649ec61e79c947f35dc32b44', { offset: 0, limit: 5 })
        return res.json(c)
    }

    @httpGet('/accessToken')
    public async generateAccessToken(req: Request, res: Response) {
        return res.json(generateAccessToken('649ec61e79c947f35dc32b44'))
    }

    @httpGet('/findUsersBySearchQuery')
    public async findUsersBySearchQuery(req: Request, res: Response) {
        const c = await this._userService.findUsersBySearchQuery({
            searchQuery: 'an',
            limit: 15,
        }, '649ec61e79c947f35dc32b46')
        return res.json(c)
    }

    @httpGet('/findMessagesByChatId')
    public async findMessagesByChatId(req: Request, res: Response) {
        const c = await this._chatService.findMessagesByChatId({
            offset: 0,
            limit: 10,
            chatId: '649ecd3b9f7966d2085cc7e4',
        })
        return res.json(c)
    }

    @httpGet('/findChatByChatMemberIds')
    public async findChatByChatMemberIds(req: Request, res: Response) {
        const c = await this._chatRepository.findChatByChatMemberIds(['649ec61e79c947f35dc32b45', '649ec61e79c947f35dc32b44'])
        return res.json(c)
    }

    @httpGet('/createChat')
    public async createChat(req: Request, res: Response) {
        const c = await this._chatService
            .createChat(
                {
                    chatMemberIds: ['64abfafb9b1c80016d78dcee', '649ec61e79c947f35dc32b47'],
                },
                '649ec61e79c947f35dc32b48',
            )
        return res.json(c)
    }
}