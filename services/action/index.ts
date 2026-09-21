import { ActionRequest, ActionResult } from '@/types/ai-support';

export interface ActionService {
  execute(request: ActionRequest): Promise<ActionResult>;
  createServiceRequest(request: ActionRequest): Promise<ActionResult>;
}

export class PlaceholderActionService implements ActionService {
  async execute(request: ActionRequest): Promise<ActionResult> {
    return {
      id: `action-result-${Date.now()}`,
      requestId: request.id,
      success: false,
      status: 'not_implemented',
      message: 'Action execution is intentionally not implemented in this phase. The service layer is reserved for future workflow orchestration.',
      data: {
        type: request.type,
        request,
      },
    };
  }

  async createServiceRequest(request: ActionRequest): Promise<ActionResult> {
    return {
      id: `action-result-${Date.now()}`,
      requestId: request.id,
      success: false,
      status: 'not_implemented',
      message: 'Service request creation will be routed through the existing dashboard and Supabase workflow in a later phase.',
      data: {
        type: 'CREATE_SERVICE_REQUEST',
        request,
      },
    };
  }
}

export const actionService = new PlaceholderActionService();
