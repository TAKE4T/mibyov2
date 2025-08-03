import React from 'react';
import { Button } from './ui/button';
import { SymptomPanel } from './result-components/SymptomPanel';
import { SolutionPanel } from './result-components/SolutionPanel';
import { HerbPanel } from './result-components/HerbPanel';
import type { Question, Answer } from '../App';
import { RefreshCw, Home } from 'lucide-react';

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

// RAGデータから選択されたレシピ（例：安眠ゆるり蒸し）
const selectedRecipe = {
  recipe_id: "R003",
  name: "安眠ゆるり蒸し",
  name_en: "peaceful_sleep_steam",
  primary_actions: ["自律神経調整", "リラックス促進", "睡眠改善"],
  primary_actions_en: ["autonomic_nervous_regulation", "relaxation_promotion", "sleep_improvement"],
  herbs: [
    { name: "よもぎ", name_en: "artemisia", properties: ["温経", "理気", "調経"] },
    { name: "イチョウ葉", name_en: "ginkgo_leaf", properties: ["活血", "化瘀", "開竅"] },
    { name: "当帰", name_en: "angelica", properties: ["補血", "活血", "調経"] },
    { name: "カモミール", name_en: "chamomile", properties: ["鎮静", "抗炎症", "リラックス"] },
    { name: "枇杷の葉", name_en: "loquat_leaf", properties: ["清熱", "潤肺", "鎮咳"] }
  ],
  target_conditions: ["M1", "M2", "M3", "M10", "M11", "F13"],
  target_symptoms: ["不眠", "不安", "緊張", "情緒不安定", "感覚過敏", "浅眠"],
  keywords: ["睡眠", "リラックス", "自律神経", "不眠", "安眠", "鎮静"],
  vector_tags: ["sleep", "relaxation", "autonomic", "insomnia", "calming", "nervous_system"],
  treatment_approach: "自律神経を整え、心身をリラックスさせることで質の良い睡眠をサポート",
  contraindications: ["低血圧", "妊娠初期"],
  session_duration: "40-50分",
  recommended_frequency: "週2-3回"
};

// モック症状データ
const mockSymptoms = [
  {
    name: "慢性疲労",
    severity: "中度" as const,
    category: "エネルギー不足",
  },
  {
    name: "睡眠障害",
    severity: "重度" as const,
    category: "睡眠の質",
  },
  {
    name: "消化不良",
    severity: "軽度" as const,
    category: "消化器系",
  },
  {
    name: "ストレス",
    severity: "中度" as const,
    category: "精神的負担",
  },
];

// 生薬データの変換
const transformedHerbs = selectedRecipe.herbs.map(herb => ({
  name: herb.name,
  latin_name: herb.name_en,
  effect: getHerbEffect(herb.name),
  dosage: getHerbDosage(herb.name),
  precautions: getHerbPrecautions(herb.name),
  compatibility: herb.properties.join("、"),
  properties: herb.properties
}));

function getHerbEffect(herbName: string): string {
  const effects: { [key: string]: string } = {
    "よもぎ": "温経作用により体を温め、気の流れを整えることで生理不順や冷え性を改善します。リラックス効果も期待できます。",
    "イチョウ葉": "血流を改善し、脳の酸素供給を促進することで集中力向上や記憶力サポートに効果があります。",
    "当帰": "血を補い、血流を促進することで女性特有の症状や冷え性、疲労回復に効果的です。",
    "カモミール": "自然な鎮静作用により不安や緊張を和らげ、良質な睡眠をサポートします。消化促進効果もあります。",
    "枇杷の葉": "肺を潤し、咳を鎮める作用があります。また、清熱作用により体内の熱を取り除く効果があります。"
  };
  return effects[herbName] || "伝統的に使用されている生薬です。";
}

function getHerbDosage(herbName: string): string {
  const dosages: { [key: string]: string } = {
    "よもぎ": "蒸し療法として週2-3回、40-50分間",
    "イチョウ葉": "蒸し療法として他の生薬と組み合わせて使用",
    "当帰": "蒸し療法として他の生薬と組み合わせて使用",
    "カモミール": "蒸し療法として就寝前の使用が効果的",
    "枇杷の葉": "蒸し療法として他の生薬と組み合わせて使用"
  };
  return dosages[herbName] || "専門家の指導のもとで使用してください";
}

function getHerbPrecautions(herbName: string): string[] {
  const precautions: { [key: string]: string[] } = {
    "よもぎ": ["妊娠中は使用を避けてください", "アレルギー体質の方は注意"],
    "イチョウ葉": ["血液をサラサラにする薬を服用中の方は注意", "手術前は使用を控えてください"],
    "当帰": ["妊娠中・授乳中は医師にご相談ください", "出血性疾患のある方は注意"],
    "カモミール": ["キク科アレルギーの方は注意", "眠気を催す場合があります"],
    "枇杷の葉": ["特に重大な注意事項はありませんが、体調に変化があれば使用を中止してください"]
  };
  return precautions[herbName] || ["使用前に専門家にご相談ください"];
}

export function NewResultScreen({ questions, answers, onRestart, language }: ResultScreenProps) {
  const content = {
    ja: {
      title: '未病問診結果',
      subtitle: 'あなたの体質と症状に基づいた、個別化された改善提案',
      disclaimer: '※ この結果は参考情報です。症状が続く場合は専門家にご相談ください。',
      restartButton: 'もう一度診断',
      homeButton: 'TOPに戻る'
    },
    en: {
      title: 'Mibyou Consultation Results',
      subtitle: 'Personalized improvement recommendations based on your constitution and symptoms',
      disclaimer: '※ These results are for reference. Please consult a specialist if symptoms persist.',
      restartButton: 'Diagnose Again',
      homeButton: 'Back to Home'
    }
  };

  const t = content[language];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact header */}
      <header className="border-b border-border px-6 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-primary">{t.title}</h1>
            <p className="text-muted-foreground text-sm">
              {t.subtitle}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.disclaimer}
          </p>
        </div>
      </header>
      
      {/* Main content area - now full width */}
      <div className="flex-1 p-6 min-h-0">
        <div className="h-full grid grid-rows-2 grid-cols-2 gap-6">
          {/* Top left - Symptoms */}
          <div className="col-span-1 row-span-1">
            <SymptomPanel symptoms={mockSymptoms} language={language} />
          </div>
          
          {/* Top right - Selected Recipe Solution */}
          <div className="col-span-1 row-span-1">
            <SolutionPanel recipe={selectedRecipe} language={language} />
          </div>
          
          {/* Bottom - Recipe Herbs (spans both columns) */}
          <div className="col-span-2 row-span-1">
            <HerbPanel herbs={transformedHerbs} language={language} recipeName={selectedRecipe.name} />
          </div>
        </div>
      </div>
      
      {/* Fixed footer with navigation buttons */}
      <div className="border-t border-border px-6 py-4 bg-card">
        <div className="flex justify-center gap-4">
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t.restartButton}
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t.homeButton}
          </Button>
        </div>
      </div>
    </div>
  );
}