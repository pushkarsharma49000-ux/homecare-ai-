export type ApiGatewayMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'WS' | 'SSE';

export interface ApiGatewayRequest<T = unknown> {
  id: string;
  route: string;
  method: ApiGatewayMethod;
  body?: T;
  headers?: Record<string, string>;
  correlationId?: string;
  timestamp: string;
}

export interface ApiGatewayError {
  code: 'VALIDATION_ERROR' | 'NOT_IMPLEMENTED' | 'ROUTING_ERROR' | 'INTERNAL_ERROR';
  message: string;
  details?: unknown;
}

export interface ApiGatewayResponse<T = unknown> {
  id: string;
  correlationId: string;
  ok: boolean;
  statusCode: number;
  timestamp: string;
  data?: T;
  error?: ApiGatewayError;
}

export type ApiGatewayHandler<TRequest = unknown, TResponse = unknown> = (
  request: ApiGatewayRequest<TRequest>
) => Promise<TResponse> | TResponse;

export interface ApiGatewayRoute<TRequest = unknown, TResponse = unknown> {
  method: ApiGatewayMethod;
  route: string;
  handler: ApiGatewayHandler<TRequest, TResponse>;
}

export class ApiGateway {
  private routes = new Map<string, ApiGatewayRoute<any, any>>();

  generateCorrelationId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `api-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  register<TRequest = unknown, TResponse = unknown>(
    route: string,
    method: ApiGatewayMethod,
    handler: ApiGatewayHandler<TRequest, TResponse>
  ): void {
    const key = `${method}:${route}`;
    this.routes.set(key, { route, method, handler });
  }

  validateRequest<T>(request: ApiGatewayRequest<T>): { valid: boolean; message?: string } {
    if (!request.route || !request.method) {
      return { valid: false, message: 'Route and method are required.' };
    }

    return { valid: true };
  }

  async route<TRequest = unknown, TResponse = unknown>(
    request: ApiGatewayRequest<TRequest>
  ): Promise<ApiGatewayResponse<TResponse>> {
    const validation = this.validateRequest(request);

    if (!validation.valid) {
      return {
        id: request.id,
        correlationId: request.correlationId || this.generateCorrelationId(),
        ok: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.message || 'Invalid request.',
        },
      };
    }

    const key = `${request.method}:${request.route}`;
    const route = this.routes.get(key);

    if (!route) {
      return {
        id: request.id,
        correlationId: request.correlationId || this.generateCorrelationId(),
        ok: false,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        error: {
          code: 'ROUTING_ERROR',
          message: `No handler registered for ${request.method} ${request.route}.`,
        },
      };
    }

    try {
      const response = await route.handler(request);

      return {
        id: request.id,
        correlationId: request.correlationId || this.generateCorrelationId(),
        ok: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: response as TResponse,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown gateway error';

      return {
        id: request.id,
        correlationId: request.correlationId || this.generateCorrelationId(),
        ok: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      };
    }
  }
}

export const apiGateway = new ApiGateway();
