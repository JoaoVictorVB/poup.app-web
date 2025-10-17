export class AccountLockedError extends Error {
  constructor(lockedUntil: Date) {
    const minutes = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60))
    super(`Conta bloqueada. Tente novamente em ${minutes} minuto(s).`)
    this.name = 'AccountLockedError'
  }
}
