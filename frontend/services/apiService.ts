// API service for communicating with the mibyou diagnosis backend
export interface DiagnosisAnswer {
  questionId: string;
  answer: string;
  timestamp?: string;
}

export interface DiagnosisRequest {
  answers: DiagnosisAnswer[];
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface HerbRecommendation {
  name: string;
  reason: string;
  effect: string;
}

export interface SolutionRecommendation {
  recipe_id: string;
  name: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DiagnosisSummary {
  summary: string;
  primary_conditions: string[];
  recommended_solutions: SolutionRecommendation[];
  recommended_herbs: HerbRecommendation[];
  lifestyle_advice: string;
  precautions?: string;
}

export interface DiagnosisResponse {
  success: boolean;
  sessionId: string;
  userId?: string;
  diagnosis: DiagnosisSummary;
  userAnswers: DiagnosisAnswer[];
  recommendations: {
    solutions: any[];
    herbs: any[];
    matchedSymptoms: any[];
  };
  processingInfo: {
    total_answers: number;
    matched_questions: number;
    matched_solutions: number;
    matched_herbs: number;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ApiError {
  error: string;
  details?: any;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;
  private timeout: number = 30000; // 30 seconds

  constructor() {
    // Use environment variable or default to localhost for development
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async submitDiagnosis(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    try {
      console.log('🚀 Submitting diagnosis request:', {
        answersCount: request.answers.length,
        sessionId: request.sessionId,
        userId: request.userId
      });

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/diagnosis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error}`);
      }

      const result: DiagnosisResponse = await response.json();
      
      console.log('✅ Diagnosis response received:', {
        success: result.success,
        sessionId: result.sessionId,
        primaryConditions: result.diagnosis.primary_conditions.length,
        recommendedSolutions: result.diagnosis.recommended_solutions.length,
        recommendedHerbs: result.diagnosis.recommended_herbs.length
      });

      return result;
    } catch (error) {
      console.error('❌ Diagnosis API error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('診断処理がタイムアウトしました。しばらく待ってから再度お試しください。');
        }
        throw new Error(`診断処理中にエラーが発生しました: ${error.message}`);
      }
      
      throw new Error('診断処理中に予期しないエラーが発生しました。');
    }
  }

  async checkApiHealth(): Promise<{ status: string; services: any }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/diagnosis/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  async getDataInfo(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/diagnosis/data-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Data info request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Data info request failed:', error);
      throw error;
    }
  }

  // Utility method to generate session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert frontend answer format to API format
  convertAnswersToApiFormat(answers: Array<{ questionId: string; value: string | string[] }>): DiagnosisAnswer[] {
    return answers.map(answer => ({
      questionId: answer.questionId,
      answer: Array.isArray(answer.value) ? answer.value.join(', ') : answer.value,
      timestamp: new Date().toISOString()
    }));
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;