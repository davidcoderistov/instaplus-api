import { ChatResolver } from './chat/chat.resolver'
import { UserResolver } from './user/user.resolver'
import { NotificationResolver } from './notification/notification.resolver'
import { SearchHistoryResolver } from './search-history/search-history.resolver'

const graphqlResolver = [
    ChatResolver,
    UserResolver,
    NotificationResolver,
    SearchHistoryResolver,
]

export default graphqlResolver