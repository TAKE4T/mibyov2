import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RefreshCw, Home, CheckCircle, AlertTriangle, Leaf, Pill, Brain, Heart, Droplet, Zap, TrendingUp, Star, Clock, AlertCircle } from 'lucide-react';
import type { Question, Answer } from '../App';
import { symptomPatternMatrix } from '../App';

interface ResultScreenProps {
  questions: Question[];
  answers: Answer[];
  onRestart: () => void;
  language: 'ja' | 'en';
  ragAnalysis?: {
    symptomScores: any;
    selectedSolutions: any[];
    herbDescriptions: any[];
  };
}

export function ResultScreen({ questions, answers, onRestart, language, ragAnalysis }: ResultScreenProps) {
  // エラーハンドリング用のステート
  const [error, setError] = React.useState<string | null>(null);

  // デバッグ情報
  console.log('ResultScreen props:', { 
    questionsCount: questions?.length, 
    answersCount: answers?.length, 
    language, 
    ragAnalysis: !!ragAnalysis 
  });

  const content = {
    ja: {
      title: '診断結果',
      subtitle: 'あなたの体質分析レポート',
      yourAnswers: 'あなたの回答一覧',
      functionalAnalysis: '機能医学的分析',
      traditionalAnalysis: '伝統医学的分析',
      constitutionType: '主要体質タイプ',
      symptoms: '検出された症状パターン',
      recommendations: 'おすすめの施術・生薬',
      herbDetails: '生薬詳細',
      lifestyle: '生活改善アドバイス',
      restartButton: 'もう一度診断',
      homeButton: 'TOPに戻る',
      noAnswer: '回答なし',
      riskLevel: 'リスクレベル',
      priority: '優先度',
      duration: '施術時間',
      frequency: '推奨頻度',
      herbs: '使用生薬',
      contraindications: '注意事項',
      approach: '治療アプローチ',
      score: '適合度',
      primaryType: '主要タイプ',
      secondaryTypes: '関連タイプ'
    },
    en: {
      title: 'Diagnosis Results',
      subtitle: 'Your Constitutional Analysis Report',
      yourAnswers: 'Your Answers',
      functionalAnalysis: 'Functional Medicine Analysis',
      traditionalAnalysis: 'Traditional Medicine Analysis',
      constitutionType: 'Primary Constitution Type',
      symptoms: 'Detected Symptom Patterns',
      recommendations: 'Recommended Treatments & Herbs',
      herbDetails: 'Herbal Details',
      lifestyle: 'Lifestyle Improvement Advice',
      restartButton: 'Take Again',
      homeButton: 'Back to Home',
      noAnswer: 'No answer',
      riskLevel: 'Risk Level',
      priority: 'Priority',
      duration: 'Session Duration',
      frequency: 'Recommended Frequency',
      herbs: 'Herbs Used',
      contraindications: 'Contraindications',
      approach: 'Treatment Approach',
      score: 'Compatibility Score',
      primaryType: 'Primary Type',
      secondaryTypes: 'Related Types'
    }
  };

  const t = content[language];

  // エラーキャッチ用のレンダリング関数
  const renderWithErrorHandling = () => {
    try {
      return renderMainContent();
    } catch (err) {
      console.error('ResultScreen rendering error:', err);
      return renderErrorFallback(err as Error);
    }
  };

  // エラーフォールバック表示
  const renderErrorFallback = (err: Error) => (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          {language === 'ja' ? '結果表示エラー' : 'Result Display Error'}
        </h2>
        <p className="text-red-600 mb-4">
          {language === 'ja' 
            ? '診断結果の表示中にエラーが発生しました。もう一度お試しください。' 
            : 'An error occurred while displaying the diagnosis results. Please try again.'}
        </p>
        <p className="text-sm text-red-500 mb-4">Error: {err.message}</p>
        <div className="space-x-4">
          <Button onClick={onRestart} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'もう一度診断' : 'Restart Diagnosis'}
          </Button>
        </div>
      </div>
    </div>
  );

  // メインコンテンツの描画
  const renderMainContent = () => {
    // RAGベースの機能医学的分析
    const analyzeFunctionalMedicine = () => {
    if (ragAnalysis) {
      return {
        autonomic: ragAnalysis.symptomScores['自律神経'] || 0,
        hormone: ragAnalysis.symptomScores['ホルモン'] || 0,
        immune: ragAnalysis.symptomScores['免疫'] || 0
      };
    }
    
    // フォールバック：従来の分析
    const analysis = {
      autonomic: 0,
      hormone: 0,
      immune: 0
    };

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const getScore = (value: string | string[]) => {
        if (Array.isArray(value)) {
          return value.some(v => ['よくある', 'Often'].includes(v)) ? 2 : 
                 value.some(v => ['たまにある', 'Sometimes'].includes(v)) ? 1 : 0;
        }
        if (['よくある', 'Often', 'とても気になる', 'Very concerned'].includes(value)) return 2;
        if (['たまにある', 'Sometimes', '少し気になる', 'Somewhat concerned'].includes(value)) return 1;
        return 0;
      };

      const score = getScore(answer.value);

      if (question.category === '自律神経' || question.categoryEn === 'autonomic_nervous') {
        analysis.autonomic += score;
      } else if (question.category === 'ホルモン' || question.categoryEn === 'hormone') {
        analysis.hormone += score;
      } else if (question.category === '免疫系' || question.categoryEn === 'immune_system') {
        analysis.immune += score;
      }
    });

    return analysis;
  };

  // 伝統医学的分析の強化版
  const analyzeTraditionalMedicine = () => {
    const analysis = {
      qi: 0,
      blood: 0,
      water: 0,
      essence: 0
    };

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const getScore = (value: string | string[]) => {
        if (Array.isArray(value)) {
          return value.some(v => ['よくある', 'Often'].includes(v)) ? 2 : 
                 value.some(v => ['たまにある', 'Sometimes'].includes(v)) ? 1 : 0;
        }
        if (['よくある', 'Often', 'とても気になる', 'Very concerned'].includes(value)) return 2;
        if (['たまにある', 'Sometimes', '少し気になる', 'Somewhat concerned'].includes(value)) return 1;
        return 0;
      };

      const score = getScore(answer.value);

      if (question.category === '気' || question.categoryEn === 'qi') {
        analysis.qi += score;
      } else if (question.category?.includes('血') || question.categoryEn?.includes('blood')) {
        analysis.blood += score;
      } else if (question.category === '水' || question.categoryEn === 'water') {
        analysis.water += score;
      } else if (question.category?.includes('精') || question.categoryEn?.includes('essence')) {
        analysis.essence += score;
      }
    });

    return analysis;
  };

  // 体質タイプ判定（症状パターンマトリックス使用）
  const determineConstitutionType = () => {
    const functionalAnalysis = analyzeFunctionalMedicine();
    const traditionalAnalysis = analyzeTraditionalMedicine();

    // 各要素のスコアを計算
    const constitutionScores = {
      気: 0,
      血: 0,
      水: 0,
      精: 0
    };

    Object.keys(constitutionScores).forEach(element => {
      const weights = symptomPatternMatrix[element as keyof typeof symptomPatternMatrix];
      constitutionScores[element as keyof typeof constitutionScores] = 
        (functionalAnalysis.autonomic * weights.自律神経) +
        (functionalAnalysis.hormone * weights.ホルモン) +
        (functionalAnalysis.immune * weights.免疫) +
        (traditionalAnalysis[element === '気' ? 'qi' : element === '血' ? 'blood' : element === '水' ? 'water' : 'essence'] * 5);
    });

    // 最高スコアの要素を主要タイプとする
    const sortedTypes = Object.entries(constitutionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([type, score]) => ({ type, score }));

    return {
      primary: sortedTypes[0],
      secondary: sortedTypes.slice(1, 3),
      scores: constitutionScores
    };
  };

  // RAGベースの生薬レシピ推奨
  const recommendHerbRecipes = () => {
    if (ragAnalysis && ragAnalysis.selectedSolutions) {
      return ragAnalysis.selectedSolutions.slice(0, 3).map((solution, index) => ({
        ...solution,
        score: solution.matchScore * 100,
        rank: index + 1,
        adaptationScore: Math.round(solution.matchScore * 100)
      }));
    }
    
    // フォールバック：従来のロジック
    const functionalAnalysis = analyzeFunctionalMedicine();
    const constitutionType = determineConstitutionType();
    
    // 回答されたIDを取得
    const answeredConditions = answers
      .filter(answer => {
        if (Array.isArray(answer.value)) {
          return answer.value.some(v => !['該当なし', 'None applicable', 'ない', 'Never'].includes(v));
        }
        return !['ない', 'Never', '気にならない', 'Not concerned'].includes(answer.value as string);
      })
      .map(answer => answer.questionId);

    // フォールバック用の基本レシピデータ
    const fallbackRecipes = [
      {
        recipe_id: "R001",
        name: "リズム巡り蒸し",
        name_en: "rhythm_circulation_steam",
        primary_actions: ["血流促進", "ホルモンバランス調整"],
        target_conditions: ["M4", "M5", "M6", "M12", "F4", "F5", "F6"],
        target_symptoms: ["月経不順", "更年期症状", "PMS", "月経痛", "血虚", "瘀血"],
        treatment_approach: "ホルモンバランスを整え、血流を改善することで女性特有の症状を緩和",
        contraindications: ["妊娠中", "重度の出血性疾患"],
        session_duration: "30-40分",
        recommended_frequency: "週2-3回",
        price: "¥8,800",
        vector_tags: ["menstrual", "hormone", "circulation"],
        herbs: [
          { name: "当帰", name_en: "Angelica sinensis" },
          { name: "芍薬", name_en: "Paeonia lactiflora" },
          { name: "川芎", name_en: "Ligusticum chuanxiong" }
        ]
      },
      {
        recipe_id: "R002",
        name: "デトックス蒸し",
        name_en: "detox_steam",
        primary_actions: ["むくみ改善", "瘀血除去", "免疫サポート"],
        target_conditions: ["M7", "M8", "F6", "F8", "F9"],
        target_symptoms: ["むくみ", "瘀血", "アレルギー", "免疫異常", "水滞"],
        treatment_approach: "体内の老廃物排出を促進し、免疫機能をサポートして全身の巡りを改善",
        contraindications: ["急性炎症期", "発熱時"],
        session_duration: "30-40分",
        recommended_frequency: "週1-2回",
        price: "¥7,200",
        vector_tags: ["detox", "edema", "immune"],
        herbs: [
          { name: "茯苓", name_en: "Poria cocos" },
          { name: "白朮", name_en: "Atractylodes macrocephala" },
          { name: "陳皮", name_en: "Citrus reticulata" }
        ]
      },
      {
        recipe_id: "R003",
        name: "安眠ゆるり蒸し",
        name_en: "peaceful_sleep_steam",
        primary_actions: ["自律神経調整", "リラックス促進", "睡眠改善"],
        target_conditions: ["M1", "M2", "M3", "M10", "M11", "F13"],
        target_symptoms: ["不眠", "不安", "緊張", "情緒不安定", "感覚過敏"],
        treatment_approach: "自律神経を整え、心身をリラックスさせることで質の良い睡眠をサポート",
        contraindications: ["低血圧", "妊娠初期"],
        session_duration: "40-50分",
        recommended_frequency: "週2-3回",
        price: "¥9,500",
        vector_tags: ["sleep", "relaxation", "autonomic"],
        herbs: [
          { name: "酸棗仁", name_en: "Ziziphus jujuba" },
          { name: "甘草", name_en: "Glycyrrhiza uralensis" },
          { name: "竜骨", name_en: "Fossilized Bone" }
        ]
      }
    ];

    // 各レシピの適合度を計算
    const recipeScores = fallbackRecipes.map(recipe => {
      let score = 0;
      
      // 対象症状との一致度
      const matchingConditions = recipe.target_conditions.filter(condition => 
        answeredConditions.includes(condition)
      ).length;
      score += matchingConditions * 3;

      // 体質タイプとの適合度
      if (constitutionType.primary.type === '気' && recipe.primary_actions.some(action => 
        action.includes('自律神経') || action.includes('リラックス'))) {
        score += 2;
      }
      if (constitutionType.primary.type === '血' && recipe.primary_actions.some(action => 
        action.includes('血流') || action.includes('ホルモン'))) {
        score += 2;
      }
      if (constitutionType.primary.type === '水' && recipe.primary_actions.some(action => 
        action.includes('むくみ') || action.includes('デトックス'))) {
        score += 2;
      }
      if (constitutionType.primary.type === '精' && recipe.primary_actions.some(action => 
        action.includes('自律神経') || action.includes('睡眠'))) {
        score += 2;
      }

      // 機能医学的分析との適合度
      if (functionalAnalysis.autonomic >= 2 && recipe.vector_tags.includes('autonomic')) {
        score += 2;
      }
      if (functionalAnalysis.hormone >= 1 && recipe.vector_tags.includes('hormone')) {
        score += 2;
      }
      if (functionalAnalysis.immune >= 1 && recipe.vector_tags.includes('immune')) {
        score += 2;
      }

      return { ...recipe, compatibility_score: score, adaptationScore: score * 10 };
    });

    return recipeScores
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 3)
      .map((recipe, index) => ({ ...recipe, rank: index + 1 }));
  };

  // 症状検出
  const detectSymptoms = () => {
    const detectedSymptoms: string[] = [];
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (question) {
        const isPositive = Array.isArray(answer.value) 
          ? answer.value.some(v => !['該当なし', 'None applicable', 'ない', 'Never'].includes(v))
          : !['ない', 'Never', '気にならない', 'Not concerned'].includes(answer.value as string);

        if (isPositive) {
          const symptomText = language === 'ja' ? question.question : question.questionEn;
          detectedSymptoms.push(symptomText);
        }
      }
    });

    return detectedSymptoms;
  };

  const functionalAnalysis = analyzeFunctionalMedicine();
  const traditionalAnalysis = analyzeTraditionalMedicine();
  const constitutionType = determineConstitutionType();
  const detectedSymptoms = detectSymptoms();
  const recommendedRecipes = recommendHerbRecipes();

  const getRiskLevel = (score: number, maxScore: number = 6) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 67) return { level: language === 'ja' ? '高' : 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (percentage >= 33) return { level: language === 'ja' ? '中' : 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { level: language === 'ja' ? '低' : 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const getConstitutionColor = (type: string) => {
    switch (type) {
      case '気': return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
      case '血': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      case '水': return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case '精': return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
      default: return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-100 via-green-100 to-pink-100 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl text-gray-800 mb-2">{t.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{t.subtitle}</p>
        <p className="text-gray-500">症状パターンマトリックスによる高精度分析結果をご確認ください。</p>
      </div>

      {/* Constitution Type Analysis */}
      <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          {t.constitutionType}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getConstitutionColor(constitutionType.primary.type).bg}`}>
                <Leaf className={`w-6 h-6 ${getConstitutionColor(constitutionType.primary.type).color}`} />
              </div>
              <div>
                <h3 className="text-lg text-gray-800">{t.primaryType}: {constitutionType.primary.type}タイプ</h3>
                <p className="text-sm text-gray-600">{t.score}: {constitutionType.primary.score.toFixed(1)}</p>
              </div>
            </div>
            <Badge className="bg-yellow-600 text-white text-sm px-3 py-1">主要</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {constitutionType.secondary.map((type, index) => {
              const colorScheme = getConstitutionColor(type.type);
              return (
                <div key={index} className={`p-3 rounded-lg border ${colorScheme.border} ${colorScheme.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`${colorScheme.color} text-sm`}>{type.type}タイプ</span>
                    <span className="text-xs text-gray-600">{type.score.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Analysis Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Functional Medicine Analysis */}
        <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            {t.functionalAnalysis}
          </h2>
          <div className="space-y-4">
            {[
              { name: language === 'ja' ? '自律神経系' : 'Autonomic Nervous', score: functionalAnalysis.autonomic, icon: Zap, max: 6 },
              { name: language === 'ja' ? 'ホルモン系' : 'Hormonal System', score: functionalAnalysis.hormone, icon: Heart, max: 2 },
              { name: language === 'ja' ? '免疫系' : 'Immune System', score: functionalAnalysis.immune, icon: Droplet, max: 2 },
            ].map((item, index) => {
              const risk = getRiskLevel(item.score, item.max);
              const IconComponent = item.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <Badge className={`${risk.color} ${risk.bg} border-0`}>
                      {risk.level}
                    </Badge>
                  </div>
                  <Progress value={(item.score / item.max) * 100} className="h-2" />
                  <div className="text-xs text-gray-500 text-right">{item.score}/{item.max}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Traditional Medicine Analysis */}
        <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            {t.traditionalAnalysis}
          </h2>
          <div className="space-y-4">
            {[
              { name: language === 'ja' ? '気（エネルギー）' : 'Qi (Energy)', score: traditionalAnalysis.qi, element: '気', max: 4 },
              { name: language === 'ja' ? '血（血液循環）' : 'Blood (Circulation)', score: traditionalAnalysis.blood, element: '血', max: 2 },
              { name: language === 'ja' ? '水（水分代謝）' : 'Water (Metabolism)', score: traditionalAnalysis.water, element: '水', max: 2 },
              { name: language === 'ja' ? '精（生命力）' : 'Essence (Vitality)', score: traditionalAnalysis.essence, element: '精', max: 2 },
            ].map((item, index) => {
              const risk = getRiskLevel(item.score, item.max);
              const colorScheme = getConstitutionColor(item.element);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorScheme.bg} border ${colorScheme.border}`}></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <Badge className={`${risk.color} ${risk.bg} border-0`}>
                      {risk.level}
                    </Badge>
                  </div>
                  <Progress value={item.max > 0 ? (item.score / item.max) * 100 : 0} className="h-2" />
                  <div className="text-xs text-gray-500 text-right">{item.score}/{item.max}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Detected Symptoms */}
      <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          {t.symptoms}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {detectedSymptoms.length > 0 ? (
            detectedSymptoms.map((symptom, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm">{symptom}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2">特に問題となる症状は検出されませんでした。</p>
          )}
        </div>
      </Card>

      {/* Herb Recipe Recommendations */}
      <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          <Pill className="w-5 h-5 text-pink-600" />
          {t.recommendations}
        </h2>
        <div className="space-y-6">
          {recommendedRecipes.map((recipe, index) => (
            <Card key={recipe.recipe_id} className={`p-5 border-2 ${index === 0 ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50' : 'border-pink-200 bg-pink-50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${index === 0 ? 'bg-pink-200' : 'bg-pink-100'}`}>
                    <Leaf className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg text-pink-800 ${index === 0 ? 'font-semibold' : ''}`}>
                      {language === 'ja' ? recipe.name : recipe.name_en}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="w-3 h-3 text-pink-600" />
                      <span className="text-xs text-pink-600">{t.score}: {recipe.compatibility_score}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${index === 0 ? 'bg-pink-700' : 'bg-pink-600'} text-white mb-2`}>
                    {language === 'ja' ? recipe.price : recipe.price_en}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-pink-600">{t.priority}: {index + 1}</span>
                    {index === 0 && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  </div>
                </div>
              </div>

              <p className="text-pink-700 text-sm mb-4 leading-relaxed">
                {language === 'ja' ? recipe.treatment_approach : recipe.treatment_approach}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-pink-700">{t.duration}: {recipe.session_duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-pink-700">{t.frequency}: {recipe.recommended_frequency}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-pink-700">{t.herbs}: {recipe.herbs?.length || 0}種類</span>
                  </div>
                  {(recipe.contraindications?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700">{t.contraindications}: {recipe.contraindications.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-pink-200 pt-3">
                <p className="text-xs text-pink-600 mb-2">{t.herbs}:</p>
                <div className="flex flex-wrap gap-1">
                  {(recipe.herbs || []).map((herb, herbIndex) => (
                    <Badge key={herbIndex} variant="outline" className="text-xs border-pink-300 text-pink-700">
                      {language === 'ja' ? herb?.name || `生薬${herbIndex + 1}` : herb?.name_en || `Herb${herbIndex + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Your Answers Summary */}
      <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {t.yourAnswers}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id);
            const questionText = language === 'ja' ? question.question : question.questionEn;
            
            let answerText = t.noAnswer;
            if (answer) {
              if (typeof answer.value === 'string') {
                answerText = answer.value;
              } else if (Array.isArray(answer.value)) {
                answerText = answer.value.join(', ');
              }
            }

            const categoryColor = question.category?.includes('自律神経') || question.categoryEn?.includes('autonomic') ? 'border-blue-200' :
                                question.category?.includes('ホルモン') || question.categoryEn?.includes('hormone') ? 'border-pink-200' :
                                question.category?.includes('免疫') || question.categoryEn?.includes('immune') ? 'border-cyan-200' :
                                question.category?.includes('気') || question.categoryEn?.includes('qi') ? 'border-green-200' :
                                question.category?.includes('血') || question.categoryEn?.includes('blood') ? 'border-red-200' :
                                question.category?.includes('水') || question.categoryEn?.includes('water') ? 'border-blue-300' :
                                question.category?.includes('精') || question.categoryEn?.includes('essence') ? 'border-purple-200' :
                                'border-gray-200';

            return (
              <div key={question.id} className={`border-l-4 ${categoryColor} pl-4 p-3 bg-gray-50 rounded-r-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {language === 'ja' ? question.category : question.categoryEn}
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm mb-1 leading-relaxed">{questionText}</p>
                <p className="text-green-700 text-sm">{answerText}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3 border-2 border-green-300 hover:border-green-400"
        >
          <RefreshCw className="w-4 h-4" />
          {t.restartButton}
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-green-500 to-pink-500 hover:from-blue-600 hover:via-green-600 hover:to-pink-600 text-white"
        >
          <Home className="w-4 h-4" />
          {t.homeButton}
        </Button>
      </div>
    </div>
    );
  };

  // エラーハンドリング付きで描画
  return renderWithErrorHandling();
}