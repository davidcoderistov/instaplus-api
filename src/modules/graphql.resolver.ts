import { ChatResolver } from './chat/chat.resolver'
import { UserResolver } from './user/user.resolver'
import { NotificationResolver } from './notification/notification.resolver'

const graphqlResolver = [
    ChatResolver,
    UserResolver,
    NotificationResolver,
]

export default graphqlResolver