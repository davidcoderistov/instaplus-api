export interface Context {
    setRefreshTokenCookie: (refreshToken: string, immediate?: boolean) => void
    getRefreshTokenCookie: () => string | undefined
    userId: string
}

export interface WsContext {
    userId: string
}