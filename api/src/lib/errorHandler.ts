import { Prisma } from '@prisma/client'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  })

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.constructor.name,
      message: error.message,
      statusCode: error.statusCode,
    } as ErrorResponse)
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Erro de validação dos dados',
      statusCode: 400,
      details: formattedErrors,
    } as ErrorResponse)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'campo'
      return reply.status(409).send({
        error: 'ConflictError',
        message: `Já existe um registro com este ${field}`,
        statusCode: 409,
      } as ErrorResponse)
    }

    if (error.code === 'P2025') {
      return reply.status(404).send({
        error: 'NotFoundError',
        message: 'Registro não encontrado',
        statusCode: 404,
      } as ErrorResponse)
    }

    if (error.code === 'P2003') {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Referência inválida a registro relacionado',
        statusCode: 400,
      } as ErrorResponse)
    }

    if (error.code === 'P1001') {
      return reply.status(503).send({
        error: 'ServiceUnavailable',
        message: 'Não foi possível conectar ao banco de dados',
        statusCode: 503,
      } as ErrorResponse)
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Dados inválidos fornecidos',
      statusCode: 400,
    } as ErrorResponse)
  }

  if ('code' in error && error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    return reply.status(401).send({
      error: 'UnauthorizedError',
      message: 'Token de autenticação não fornecido',
      statusCode: 401,
    } as ErrorResponse)
  }

  if ('code' in error && error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    return reply.status(401).send({
      error: 'UnauthorizedError',
      message: 'Token de autenticação inválido',
      statusCode: 401,
    } as ErrorResponse)
  }

  if ('code' in error && error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    return reply.status(401).send({
      error: 'UnauthorizedError',
      message: 'Token de autenticação expirado',
      statusCode: 401,
    } as ErrorResponse)
  }

  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' 
    ? error.statusCode 
    : 500

  return reply.status(statusCode).send({
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
    statusCode,
  } as ErrorResponse)
}
