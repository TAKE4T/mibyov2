const { OpenAI } = require('openai');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { Document } = require('langchain/document');

class RAGService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    });
    this.vectorStore = null;
    this.ragData = null;
  }

  async initialize(ragData) {
    this.ragData = ragData;
    await this.createVectorStore();
    console.log('✅ RAG Service initialized with vector embeddings');
  }

  async createVectorStore() {
    try {
      const documents = [];

      // Process questions data
      if (this.ragData.questions?.functional_medicine_categories) {
        this.ragData.questions.functional_medicine_categories.forEach(category => {
          documents.push(new Document({
            pageContent: `${category.symptom} ${category.keywords?.join(' ')} ${category.vector_tags?.join(' ')}`,
            metadata: {
              type: 'question',
              id: category.id,
              category: category.category,
              category_en: category.category_en,
              symptom: category.symptom,
              symptom_en: category.symptom_en,
              keywords: category.keywords,
              vector_tags: category.vector_tags
            }
          }));
        });
      }

      // Process solutions data
      if (Array.isArray(this.ragData.solutions)) {
        this.ragData.solutions.forEach(solution => {
          const content = [
            solution.name,
            solution.treatment_approach,
            solution.target_symptoms?.join(' '),
            solution.keywords?.join(' '),
            solution.vector_tags?.join(' '),
            solution.herbs?.map(herb => `${herb.name} ${herb.properties?.join(' ')}`).join(' ')
          ].filter(Boolean).join(' ');

          documents.push(new Document({
            pageContent: content,
            metadata: {
              type: 'solution',
              recipe_id: solution.recipe_id,
              name: solution.name,
              name_en: solution.name_en,
              primary_actions: solution.primary_actions,
              herbs: solution.herbs,
              target_conditions: solution.target_conditions,
              target_symptoms: solution.target_symptoms,
              treatment_approach: solution.treatment_approach,
              session_duration: solution.session_duration,
              recommended_frequency: solution.recommended_frequency,
              contraindications: solution.contraindications
            }
          }));
        });
      }

      // Process herbs data
      if (Array.isArray(this.ragData.herbs)) {
        this.ragData.herbs.forEach(herb => {
          documents.push(new Document({
            pageContent: herb.content,
            metadata: {
              type: 'herb',
              id: herb.id,
              category: herb.metadata.category,
              name: herb.metadata.name,
              latin: herb.metadata.latin,
              main_components: herb.metadata.main_components,
              pharmacology: herb.metadata.pharmacology,
              steam_effect: herb.metadata.steam_effect
            }
          }));
        });
      }

      // Create vector store
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        this.embeddings
      );

      console.log(`📚 Vector store created with ${documents.length} documents`);
    } catch (error) {
      console.error('❌ Error creating vector store:', error);
      throw error;
    }
  }

  async findRelevantContent(userAnswers, topK = 5) {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Combine all user answers into a single query string
      const queryText = userAnswers.map(answer => 
        `${answer.questionId}: ${answer.answer}`
      ).join(' ');

      console.log('🔍 Searching for relevant content with query:', queryText.substring(0, 100) + '...');

      // Perform similarity search
      const results = await this.vectorStore.similaritySearch(queryText, topK * 2);

      // Separate results by type
      const relevantQuestions = results.filter(doc => doc.metadata.type === 'question');
      const relevantSolutions = results.filter(doc => doc.metadata.type === 'solution');
      const relevantHerbs = results.filter(doc => doc.metadata.type === 'herb');

      console.log(`📊 Found ${relevantQuestions.length} relevant questions, ${relevantSolutions.length} solutions, ${relevantHerbs.length} herbs`);

      return {
        questions: relevantQuestions.slice(0, topK),
        solutions: relevantSolutions.slice(0, topK),
        herbs: relevantHerbs.slice(0, topK)
      };
    } catch (error) {
      console.error('❌ Error in similarity search:', error);
      throw error;
    }
  }

  async generateDiagnosisSummary(userAnswers, relevantContent) {
    try {
      const prompt = this.createDiagnosisPrompt(userAnswers, relevantContent);
      
      console.log('🤖 Generating diagnosis summary with OpenAI...');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `あなたは未病診断の専門家です。東洋医学と機能医学の知識を基に、ユーザーの回答から健康状態を分析し、適切な蒸し療法と生薬を推奨してください。

診断結果は以下のJSON形式で返してください：
{
  "summary": "診断の要約（200-300文字）",
  "primary_conditions": ["主要な症状や状態のリスト"],
  "recommended_solutions": [
    {
      "recipe_id": "レシピID",
      "name": "蒸し療法名",
      "reason": "推奨理由",
      "priority": "high|medium|low"
    }
  ],
  "recommended_herbs": [
    {
      "name": "生薬名",
      "reason": "推奨理由",
      "effect": "期待される効果"
    }
  ],
  "lifestyle_advice": "生活習慣のアドバイス（100-150文字）",
  "precautions": "注意事項があれば記載"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.warn('⚠️  Failed to parse JSON response, returning raw text');
        return {
          summary: response,
          primary_conditions: [],
          recommended_solutions: [],
          recommended_herbs: [],
          lifestyle_advice: '',
          precautions: ''
        };
      }
    } catch (error) {
      console.error('❌ Error generating diagnosis summary:', error);
      throw error;
    }
  }

  createDiagnosisPrompt(userAnswers, relevantContent) {
    const answersText = userAnswers.map(answer => 
      `質問ID ${answer.questionId}: ${answer.answer}`
    ).join('\n');

    const relevantSolutions = relevantContent.solutions.map(doc => 
      `【${doc.metadata.name}】${doc.metadata.treatment_approach}`
    ).join('\n');

    const relevantHerbs = relevantContent.herbs.map(doc => 
      `【${doc.metadata.name}】${doc.pageContent.substring(0, 200)}...`
    ).join('\n');

    return `
ユーザーの診断回答：
${answersText}

関連する蒸し療法：
${relevantSolutions}

関連する生薬情報：
${relevantHerbs}

上記の情報を基に、ユーザーの健康状態を分析し、適切な診断結果と推奨事項をJSON形式で提供してください。
`;
  }

  async processUserDiagnosis(userAnswers) {
    try {
      console.log(`🎯 Processing diagnosis for ${userAnswers.length} user answers`);

      // Step 1: Find relevant content using vector search
      const relevantContent = await this.findRelevantContent(userAnswers);

      // Step 2: Generate diagnosis summary using OpenAI
      const diagnosisSummary = await this.generateDiagnosisSummary(userAnswers, relevantContent);

      // Step 3: Compile final results
      const result = {
        user_answers: userAnswers,
        diagnosis_summary: diagnosisSummary,
        relevant_content: {
          matched_symptoms: relevantContent.questions.map(doc => doc.metadata),
          recommended_solutions: relevantContent.solutions.map(doc => doc.metadata),
          relevant_herbs: relevantContent.herbs.map(doc => doc.metadata)
        },
        timestamp: new Date().toISOString(),
        processing_info: {
          total_answers: userAnswers.length,
          matched_questions: relevantContent.questions.length,
          matched_solutions: relevantContent.solutions.length,
          matched_herbs: relevantContent.herbs.length
        }
      };

      console.log('✅ Diagnosis processing completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error processing user diagnosis:', error);
      throw error;
    }
  }
}

module.exports = RAGService;