const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

class FirebaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Firebase Admin SDK
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token"
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      this.db = admin.firestore();
      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
      
      // Load local RAG data if Firestore is not available or for development
      await this.loadLocalRagData();
      
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed, using local data only:', error.message);
      await this.loadLocalRagData();
    }
  }

  async loadLocalRagData() {
    try {
      const questionsPath = path.join(__dirname, '../questions_rag.json');
      const symptomsPath = path.join(__dirname, '../symptoms_rag.json');
      const solutionsPath = path.join(__dirname, '../solutions_rag.json');
      const herbsPath = path.join(__dirname, '../herb_descriptions_rag.json');

      this.localData = {
        questions: JSON.parse(fs.readFileSync(questionsPath, 'utf8')),
        symptoms: JSON.parse(fs.readFileSync(symptomsPath, 'utf8')),
        solutions: JSON.parse(fs.readFileSync(solutionsPath, 'utf8')),
        herbs: fs.readFileSync(herbsPath, 'utf8').trim().split('\n').map(line => JSON.parse(line))
      };

      console.log('✅ Local RAG data loaded successfully');
      console.log(`📊 Data summary:
        - Questions: ${this.localData.questions.functional_medicine_categories?.length || 0} functional medicine categories
        - Symptoms: Available symptom mappings
        - Solutions: ${Array.isArray(this.localData.solutions) ? this.localData.solutions.length : 'Object format'}
        - Herbs: ${this.localData.herbs.length} herb descriptions`);
        
    } catch (error) {
      console.error('❌ Failed to load local RAG data:', error);
      throw new Error('Cannot load RAG data from local files');
    }
  }

  async getRagQuestions() {
    if (this.localData?.questions) {
      return this.localData.questions;
    }

    if (!this.db) {
      throw new Error('Database not initialized and no local data available');
    }

    try {
      const snapshot = await this.db.collection('rag_questions').get();
      const questions = [];
      snapshot.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
      });
      return questions;
    } catch (error) {
      console.error('Error fetching questions from Firestore:', error);
      throw error;
    }
  }

  async getRagSymptoms() {
    if (this.localData?.symptoms) {
      return this.localData.symptoms;
    }

    if (!this.db) {
      throw new Error('Database not initialized and no local data available');
    }

    try {
      const snapshot = await this.db.collection('rag_symptoms').get();
      const symptoms = [];
      snapshot.forEach(doc => {
        symptoms.push({ id: doc.id, ...doc.data() });
      });
      return symptoms;
    } catch (error) {
      console.error('Error fetching symptoms from Firestore:', error);
      throw error;
    }
  }

  async getRagSolutions() {
    if (this.localData?.solutions) {
      return this.localData.solutions;
    }

    if (!this.db) {
      throw new Error('Database not initialized and no local data available');
    }

    try {
      const snapshot = await this.db.collection('rag_solutions').get();
      const solutions = [];
      snapshot.forEach(doc => {
        solutions.push({ id: doc.id, ...doc.data() });
      });
      return solutions;
    } catch (error) {
      console.error('Error fetching solutions from Firestore:', error);
      throw error;
    }
  }

  async getRagHerbs() {
    if (this.localData?.herbs) {
      return this.localData.herbs;
    }

    if (!this.db) {
      throw new Error('Database not initialized and no local data available');
    }

    try {
      const snapshot = await this.db.collection('rag_herbs').get();
      const herbs = [];
      snapshot.forEach(doc => {
        herbs.push({ id: doc.id, ...doc.data() });
      });
      return herbs;
    } catch (error) {
      console.error('Error fetching herbs from Firestore:', error);
      throw error;
    }
  }

  async getAllRagData() {
    try {
      const [questions, symptoms, solutions, herbs] = await Promise.all([
        this.getRagQuestions(),
        this.getRagSymptoms(),
        this.getRagSolutions(),
        this.getRagHerbs()
      ]);

      return {
        questions,
        symptoms,
        solutions,
        herbs
      };
    } catch (error) {
      console.error('Error fetching all RAG data:', error);
      throw error;
    }
  }
}

module.exports = new FirebaseService();