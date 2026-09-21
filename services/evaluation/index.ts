export interface EvaluationMetric {
  name: string;
  value: number;
  status: 'pass' | 'warning' | 'fail';
}

export interface EvaluationService {
  evaluateSession(sessionId: string): Promise<EvaluationMetric[]>;
  recordOutcome(sessionId: string, outcome: string): Promise<void>;
}

export class PlaceholderEvaluationService implements EvaluationService {
  async evaluateSession(_sessionId: string): Promise<EvaluationMetric[]> {
    return [
      {
        name: 'conversation-ready',
        value: 0,
        status: 'warning',
      },
    ];
  }

  async recordOutcome(_sessionId: string, _outcome: string): Promise<void> {
    // Placeholder for future evaluation logging and trace collection.
  }
}

export const evaluationService = new PlaceholderEvaluationService();
