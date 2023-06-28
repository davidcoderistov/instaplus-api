export interface IWsServerService {
    initialize(): void

    dispose(): Promise<void>
}