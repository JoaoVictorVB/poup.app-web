import type { FastifyRequest } from 'fastify'

interface SecurityEvent {
  type:
    | 'failed_login'
    | 'suspicious_request'
    | 'rate_limit_exceeded'
    | 'sql_injection_attempt'
    | 'xss_attempt'
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip: string
  user_id?: string
  endpoint?: string
  details: string
}

interface ThreatScore {
  ip: string
  score: number
  events: SecurityEvent[]
  lastActivity: Date
}

const threatScores = new Map<string, ThreatScore>()

const THREAT_THRESHOLDS = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 100,
}

const EVENT_SCORES = {
  failed_login: 5,
  suspicious_request: 10,
  rate_limit_exceeded: 15,
  sql_injection_attempt: 50,
  xss_attempt: 50,
}

const DECAY_RATE = 0.1
const BLOCK_THRESHOLD = 75

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const ip = event.ip
  const score = EVENT_SCORES[event.type]

  let threatScore = threatScores.get(ip)
  if (!threatScore) {
    threatScore = {
      ip,
      score: 0,
      events: [],
      lastActivity: new Date(),
    }
    threatScores.set(ip, threatScore)
  }

  threatScore.score += score
  threatScore.events.push(event)
  threatScore.lastActivity = new Date()

  if (threatScore.events.length > 50) {
    threatScore.events = threatScore.events.slice(-50)
  }

  console.log(`🚨 IDS Alert [${event.severity}]:`, {
    type: event.type,
    ip: event.ip,
    score: threatScore.score,
    details: event.details,
  })

  // Se atingir threshold crítico, alertar
  if (threatScore.score >= BLOCK_THRESHOLD) {
    console.error(`🔒 CRITICAL: IP ${ip} blocked - Threat score: ${threatScore.score}`)
  }

  // Salvar no banco de dados (opcional - criar tabela security_events)
  // await prisma.securityEvent.create({ data: event })
}

export function isIPBlocked(ip: string): boolean {
  const threatScore = threatScores.get(ip)
  if (!threatScore) return false

  const hoursSinceLastActivity =
    (Date.now() - threatScore.lastActivity.getTime()) / (1000 * 60 * 60)
  const decayFactor = Math.pow(1 - DECAY_RATE, hoursSinceLastActivity)
  threatScore.score = Math.max(0, threatScore.score * decayFactor)

  return threatScore.score >= BLOCK_THRESHOLD
}

export function getThreatScore(ip: string): number {
  const threatScore = threatScores.get(ip)
  if (!threatScore) return 0

  const hoursSinceLastActivity =
    (Date.now() - threatScore.lastActivity.getTime()) / (1000 * 60 * 60)
  const decayFactor = Math.pow(1 - DECAY_RATE, hoursSinceLastActivity)
  return Math.max(0, threatScore.score * decayFactor)
}

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /('|\b)(OR|AND)(\b|').*('|=)/i,
    /--/,
    /;.*(\bDROP\b|\bDELETE\b|\bINSERT\b)/i,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

export async function validateRequest(request: FastifyRequest): Promise<boolean> {
  const ip = request.ip

  if (isIPBlocked(ip)) {
    await logSecurityEvent({
      type: 'suspicious_request',
      severity: 'critical',
      ip,
      endpoint: request.url,
      details: 'Request from blocked IP',
    })
    return false
  }

  const bodyString = JSON.stringify(request.body || {})
  const queryString = JSON.stringify(request.query || {})

  if (detectSQLInjection(bodyString) || detectSQLInjection(queryString)) {
    await logSecurityEvent({
      type: 'sql_injection_attempt',
      severity: 'critical',
      ip,
      endpoint: request.url,
      details: 'SQL injection pattern detected',
    })
    return false
  }

  if (detectXSS(bodyString) || detectXSS(queryString)) {
    await logSecurityEvent({
      type: 'xss_attempt',
      severity: 'critical',
      ip,
      endpoint: request.url,
      details: 'XSS pattern detected',
    })
    return false
  }

  const userAgent = request.headers['user-agent'] || ''
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'nessus']
  if (suspiciousAgents.some((agent) => userAgent.toLowerCase().includes(agent))) {
    await logSecurityEvent({
      type: 'suspicious_request',
      severity: 'high',
      ip,
      endpoint: request.url,
      details: `Suspicious User-Agent: ${userAgent}`,
    })
  }

  return true
}

export async function logFailedLogin(ip: string, email: string): Promise<void> {
  await logSecurityEvent({
    type: 'failed_login',
    severity: 'medium',
    ip,
    details: `Failed login attempt for email: ${email}`,
  })
}

export async function logRateLimitExceeded(ip: string, endpoint: string): Promise<void> {
  await logSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'medium',
    ip,
    endpoint,
    details: 'Rate limit exceeded',
  })
}

export function cleanupOldScores(): void {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  for (const [ip, score] of threatScores.entries()) {
    if (score.lastActivity.getTime() < oneDayAgo && score.score < 10) {
      threatScores.delete(ip)
    }
  }
}

export function getIDSStats() {
  const stats = {
    totalIPs: threatScores.size,
    blockedIPs: 0,
    highRiskIPs: 0,
    mediumRiskIPs: 0,
    lowRiskIPs: 0,
  }

  for (const [ip] of threatScores.entries()) {
    const currentScore = getThreatScore(ip)
    if (currentScore >= BLOCK_THRESHOLD) stats.blockedIPs++
    else if (currentScore >= THREAT_THRESHOLDS.high) stats.highRiskIPs++
    else if (currentScore >= THREAT_THRESHOLDS.medium) stats.mediumRiskIPs++
    else if (currentScore >= THREAT_THRESHOLDS.low) stats.lowRiskIPs++
  }

  return stats
}

setInterval(cleanupOldScores, 60 * 60 * 1000)
