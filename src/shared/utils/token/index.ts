import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { IncomingHttpHeaders } from 'http'


export function generateAccessToken(userId: string): string {
    return jwt.sign({
        id: userId,
        access: true,
    }, process.env.SECRET_KEY as string, { expiresIn: '2h' })
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({
        id: userId,
        refresh: true,
    }, process.env.SECRET_KEY as string, { expiresIn: '7d' })
}

export function verifyToken(token: string): Promise<{ id: string, access?: boolean, refresh?: boolean }> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.SECRET_KEY as string,
            (err, token) => {
                if (err) {
                    reject(err)
                }
                const t = token as unknown as { id: string, access?: boolean, refresh?: boolean }
                resolve(t)
            },
        )
    })
}

export function serializeRefreshToken(refreshToken: string, immediate: boolean = false) {
    return cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: immediate ? 0 : 7 * 24 * 60 * 60,
        path: '/',
    })
}

export function deserializeRefreshToken(cookies: string): string | undefined {
    return cookie.parse(cookies)?.refreshToken
}

export async function getUserIdFromAuthHeader(headers: IncomingHttpHeaders): Promise<string | null> {
    const { authorization } = headers
    if (authorization && authorization.startsWith('Bearer')) {
        const accessToken = authorization.slice(7).trim()
        try {
            const decoded = await verifyToken(accessToken)
            if (decoded.id && decoded.access) {
                return decoded.id
            }
        } catch {
        }
    }
    return null
}

export async function getUserIdFromConnectionParams(params: any): Promise<string | null> {
    const accessToken = params?.accessToken
    if (accessToken) {
        try {
            const decoded = await verifyToken(accessToken)
            if (decoded.id && decoded.access) {
                return decoded.id
            }
        } catch (e) {
            throw e
        }
    }
    return null
}

