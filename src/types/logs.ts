export type LogType = 'info' | 'warn' | 'error' | 'thought' | 'event' | 'success'

export interface LogEntry {
  readonly id: string
  readonly timestamp: number
  readonly message: string
  readonly type: LogType
}
