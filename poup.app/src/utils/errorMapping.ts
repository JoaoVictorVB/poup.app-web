export type ApiErrorType = 
  | 'ValidationError'
  | 'UnauthorizedError'
  | 'ForbiddenError'
  | 'NotFoundError'
  | 'ConflictError'
  | 'InternalServerError';

export interface ApiError {
  error: ApiErrorType;
  message: string;
  statusCode: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AppError {
  type: ApiErrorType | 'NetworkError' | 'UnknownError';
  message: string;
  userMessage: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
}

const errorMessagesMap: Record<string, string> = {
  'Token de autenticação inválido ou expirado': 'Sua sessão expirou. Faça login novamente.',
  'Token de autenticação não fornecido': 'Você precisa estar logado para acessar esta página.',
  'Token de autenticação inválido': 'Sessão inválida. Faça login novamente.',
  'Email ou senha incorretos': 'Email ou senha incorretos. Verifique e tente novamente.',
  'Este email já está cadastrado': 'Este email já está em uso. Tente fazer login ou use outro email.',
  
  // Mensagens de segurança de senha
  'A senha deve ter no mínimo 10 caracteres': 'A senha deve ter no mínimo 10 caracteres.',
  'A senha deve conter pelo menos uma letra maiúscula': 'A senha deve conter pelo menos uma letra maiúscula.',
  'A senha deve conter pelo menos uma letra minúscula': 'A senha deve conter pelo menos uma letra minúscula.',
  'A senha deve conter pelo menos um número': 'A senha deve conter pelo menos um número.',
  'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)': 'A senha deve conter pelo menos um caractere especial (!@#$%...).',
  'Email inválido. Por favor, insira um email válido.': 'Email inválido. Verifique o formato do email.',
  'Senha é obrigatória.': 'Por favor, informe sua senha.',
  
  'Invalid credentials': 'Email ou senha incorretos.',
  'User already exists': 'Este email já está cadastrado.',
  
  'A data de pagamento não pode ser no passado': 'Escolha uma data futura para o próximo pagamento.',
  'A data do evento não pode ser há mais de 1 ano': 'Escolha uma data mais recente para o evento.',
  'Preço deve ser maior que zero': 'Informe um valor válido para o preço.',
  'Erro de validação dos dados': 'Alguns campos estão preenchidos incorretamente. Verifique e tente novamente.',
  
  'Você não tem permissão para editar esta assinatura': 'Você não pode editar assinaturas de outros usuários.',
  'Você não tem permissão para deletar esta assinatura': 'Você não pode deletar assinaturas de outros usuários.',
  
  'Assinatura não encontrada': 'Esta assinatura não existe ou foi removida.',
  'Usuário não encontrado': 'Usuário não encontrado.',
  'Evento não encontrado': 'Este evento não existe ou foi removido.',
  
  'Erro interno do servidor': 'Ocorreu um erro no servidor. Tente novamente em alguns instantes.',
  'Erro ao conectar com o banco de dados': 'Não foi possível conectar ao banco de dados. Tente novamente.',
};

const defaultMessagesByType: Record<ApiErrorType | 'NetworkError', string> = {
  ValidationError: 'Verifique os campos e tente novamente.',
  UnauthorizedError: 'Você precisa fazer login para continuar.',
  ForbiddenError: 'Você não tem permissão para realizar esta ação.',
  NotFoundError: 'O recurso solicitado não foi encontrado.',
  ConflictError: 'Esta ação não pode ser realizada devido a um conflito.',
  InternalServerError: 'Ocorreu um erro no servidor. Tente novamente.',
  NetworkError: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
};

export function getUserFriendlyMessage(message: string, type?: ApiErrorType | 'NetworkError'): string {
  const mappedMessage = errorMessagesMap[message];
  if (mappedMessage) {
    return mappedMessage;
  }
  
  if (type && defaultMessagesByType[type]) {
    return defaultMessagesByType[type];
  }
  
  return message;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleApiError(error: any): AppError {
  if (error.response?.data) {
    const responseData = error.response.data;
    
    const fieldErrors: Record<string, string> = {};
    if (responseData.errors && Array.isArray(responseData.errors)) {
      responseData.errors.forEach((detail: { field: string; message: string }) => {
        fieldErrors[detail.field] = detail.message;
      });
    }
    
    let errorType: ApiErrorType | 'NetworkError' = 'UnknownError' as ApiErrorType;
    const statusCode = error.response.status;
    
    if (statusCode === 400) errorType = 'ValidationError';
    else if (statusCode === 401) errorType = 'UnauthorizedError';
    else if (statusCode === 403) errorType = 'ForbiddenError';
    else if (statusCode === 404) errorType = 'NotFoundError';
    else if (statusCode === 409) errorType = 'ConflictError';
    else if (statusCode === 423) errorType = 'UnauthorizedError'; // Conta bloqueada
    else if (statusCode >= 500) errorType = 'InternalServerError';
    
    const message = responseData.message || 'Unknown error';
    
    return {
      type: errorType,
      message,
      userMessage: getUserFriendlyMessage(message, errorType),
      statusCode,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }
  
  if (error.request && !error.response) {
    return {
      type: 'NetworkError',
      message: 'Network Error',
      userMessage: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
    };
  }
  
  return {
    type: 'UnknownError',
    message: error.message || 'Unknown error',
    userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
  };
}

export function isAuthError(error: AppError): boolean {
  return error.type === 'UnauthorizedError' || error.statusCode === 401 || error.statusCode === 423;
}

export function isValidationError(error: AppError): boolean {
  return error.type === 'ValidationError' || error.statusCode === 400;
}

export function isConflictError(error: AppError): boolean {
  return error.type === 'ConflictError' || error.statusCode === 409;
}

export function isNotFoundError(error: AppError): boolean {
  return error.type === 'NotFoundError' || error.statusCode === 404;
}

export function isForbiddenError(error: AppError): boolean {
  return error.type === 'ForbiddenError' || error.statusCode === 403;
}
