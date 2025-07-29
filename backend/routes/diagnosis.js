const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const firebaseService = require('../services/firebaseService');
const RAGService = require('../services/ragService');

const router = express.Router();
let ragService = null;

// Initialize services
const initializeServices = async () => {
  if (ragService) return ragService;

  try {
    console.log('🔄 Initializing services...');
    
    // Initialize Firebase service
    await firebaseService.initialize();
    
    // Get RAG data
    const ragData = await firebaseService.getAllRagData();
    
    // Initialize RAG service
    ragService = new RAGService();
    await ragService.initialize(ragData);
    
    console.log('✅ All services initialized successfully');
    return ragService;
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
};

// Validation schema for diagnosis request
const diagnosisSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      answer: Joi.string().required(),
      timestamp: Joi.string().isoDate().optional()
    })
  ).min(1).required(),
  userId: Joi.string().optional(),
  sessionId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// POST /api/diagnosis - Main diagnosis endpoint
router.post('/diagnosis', async (req, res, next) => {
  try {
    console.log('📥 Received diagnosis request');

    // Validate request body
    const { error, value } = diagnosisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    const { answers, userId, sessionId, metadata } = value;

    // Initialize services if not already done
    const ragServiceInstance = await initializeServices();

    // Generate session ID if not provided
    const diagnosisSessionId = sessionId || uuidv4();

    console.log(`🎯 Processing diagnosis for session: ${diagnosisSessionId}`);
    console.log(`📊 Received ${answers.length} user answers`);

    // Process diagnosis using RAG service
    const diagnosisResult = await ragServiceInstance.processUserDiagnosis(answers);

    // Prepare response
    const response = {
      success: true,
      sessionId: diagnosisSessionId,
      userId: userId || null,
      diagnosis: diagnosisResult.diagnosis_summary,
      userAnswers: diagnosisResult.user_answers,
      recommendations: {
        solutions: diagnosisResult.relevant_content.recommended_solutions,
        herbs: diagnosisResult.relevant_content.relevant_herbs,
        matchedSymptoms: diagnosisResult.relevant_content.matched_symptoms
      },
      processingInfo: diagnosisResult.processing_info,
      timestamp: diagnosisResult.timestamp,
      metadata: metadata || null
    };

    console.log('✅ Diagnosis completed successfully');
    console.log(`📋 Generated ${response.recommendations.solutions.length} solution recommendations`);
    console.log(`🌿 Generated ${response.recommendations.herbs.length} herb recommendations`);

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in diagnosis endpoint:', error);
    next(error);
  }
});

// GET /api/diagnosis/health - Health check for diagnosis service
router.get('/diagnosis/health', async (req, res) => {
  try {
    const status = {
      service: 'diagnosis',
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        firebase: firebaseService.initialized,
        rag: ragService !== null,
        openai: !!process.env.OPENAI_API_KEY
      }
    };

    // Try to initialize services if not already done
    if (!ragService) {
      try {
        await initializeServices();
        status.services.firebase = firebaseService.initialized;
        status.services.rag = true;
      } catch (error) {
        status.status = 'DEGRADED';
        status.error = 'Service initialization failed';
        status.details = error.message;
      }
    }

    const httpStatus = status.status === 'OK' ? 200 : 503;
    res.status(httpStatus).json(status);

  } catch (error) {
    res.status(500).json({
      service: 'diagnosis',
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/diagnosis/data-info - Get information about available RAG data
router.get('/diagnosis/data-info', async (req, res, next) => {
  try {
    console.log('📊 Data info request received');

    const ragServiceInstance = await initializeServices();
    const ragData = await firebaseService.getAllRagData();

    const dataInfo = {
      questions: {
        functional_medicine_categories: ragData.questions?.functional_medicine_categories?.length || 0,
        available_categories: ragData.questions?.functional_medicine_categories?.map(cat => ({
          id: cat.id,
          category: cat.category,
          category_en: cat.category_en
        })) || []
      },
      solutions: {
        total_recipes: Array.isArray(ragData.solutions) ? ragData.solutions.length : 0,
        available_recipes: Array.isArray(ragData.solutions) 
          ? ragData.solutions.map(sol => ({
              recipe_id: sol.recipe_id,
              name: sol.name,
              name_en: sol.name_en
            }))
          : []
      },
      herbs: {
        total_herbs: Array.isArray(ragData.herbs) ? ragData.herbs.length : 0,
        categories: Array.isArray(ragData.herbs) 
          ? [...new Set(ragData.herbs.map(herb => herb.metadata?.category).filter(Boolean))]
          : []
      },
      vector_store_status: ragServiceInstance?.vectorStore ? 'initialized' : 'not_initialized',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(dataInfo);

  } catch (error) {
    console.error('❌ Error in data-info endpoint:', error);
    next(error);
  }
});

module.exports = router;