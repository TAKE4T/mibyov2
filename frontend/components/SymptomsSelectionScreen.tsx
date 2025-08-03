import { useState, useMemo } from 'react';
import { SymptomCard } from './ui-components/SymptomCard';
import { CategoryFilter } from './ui-components/CategoryFilter';
import { SelectionResults } from './ui-components/SelectionResults';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { SymptomItem, MedicalData } from '../types/medical-data';

interface SymptomsSelectionScreenProps {
  onComplete: (selectedSymptomIds: string[]) => void;
  language: 'ja' | 'en';
}

// RAGデータ from backend
const medicalData: MedicalData = {
  "functional_medicine_categories": [
    {
      "id": "M1",
      "category": "自律神経",
      "category_en": "autonomic_nervous",
      "symptom": "寝つきが悪く、夜中に目が覚める",
      "symptom_en": "difficulty_falling_asleep_night_awakening",
      "keywords": ["睡眠障害", "不眠", "夜間覚醒", "入眠困難"],
      "vector_tags": ["sleep", "insomnia", "autonomic", "nervous_system"]
    },
    {
      "id": "M2",
      "category": "自律神経",
      "category_en": "autonomic_nervous",
      "symptom": "緊張しやすく、心配ごとが頭から離れない",
      "symptom_en": "easily_tense_persistent_worry",
      "keywords": ["不安", "緊張", "心配", "ストレス"],
      "vector_tags": ["anxiety", "tension", "worry", "stress", "autonomic"]
    },
    {
      "id": "M3",
      "category": "自律神経",
      "category_en": "autonomic_nervous",
      "symptom": "朝が苦手で、ぼーっとしてしまう",
      "symptom_en": "morning_difficulty_mental_fog",
      "keywords": ["朝の不調", "集中力低下", "ぼんやり", "覚醒困難"],
      "vector_tags": ["morning", "fog", "concentration", "awakening", "autonomic"]
    },
    {
      "id": "M10",
      "category": "自律神経",
      "category_en": "autonomic_nervous",
      "symptom": "急にイライラしたり涙が出たり、情緒が不安定になる",
      "symptom_en": "sudden_irritability_crying_emotional_instability",
      "keywords": ["情緒不安定", "イライラ", "涙もろい", "感情の波"],
      "vector_tags": ["emotional", "instability", "irritability", "mood", "autonomic"]
    },
    {
      "id": "M11",
      "category": "自律神経",
      "category_en": "autonomic_nervous",
      "symptom": "音や光に敏感になりやすい",
      "symptom_en": "sensitivity_to_sound_light",
      "keywords": ["感覚過敏", "光過敏", "音過敏", "刺激敏感"],
      "vector_tags": ["sensitivity", "light", "sound", "hypersensitivity", "autonomic"]
    },
    {
      "id": "M4",
      "category": "ホルモン",
      "category_en": "hormone",
      "symptom": "月経のリズムが安定しない",
      "symptom_en": "irregular_menstrual_rhythm",
      "keywords": ["月経不順", "生理不順", "月経周期", "ホルモンバランス"],
      "vector_tags": ["menstrual", "irregular", "cycle", "hormone", "rhythm"]
    },
    {
      "id": "M5",
      "category": "ホルモン",
      "category_en": "hormone",
      "symptom": "更年期症状が気になる（ほてり、イライラなど）",
      "symptom_en": "menopause_symptoms_hot_flashes_irritability",
      "keywords": ["更年期", "ほてり", "のぼせ", "更年期障害"],
      "vector_tags": ["menopause", "hot_flash", "hormonal", "transition"]
    },
    {
      "id": "M6",
      "category": "ホルモン",
      "category_en": "hormone",
      "symptom": "月経前に胸の張りや気分の波がある",
      "symptom_en": "premenstrual_breast_tenderness_mood_changes",
      "keywords": ["PMS", "月経前症候群", "胸の張り", "気分変動"],
      "vector_tags": ["PMS", "premenstrual", "breast", "mood", "hormone"]
    },
    {
      "id": "M12",
      "category": "ホルモン",
      "category_en": "hormone",
      "symptom": "月経痛が強い or 急に重くなった",
      "symptom_en": "severe_menstrual_pain_sudden_worsening",
      "keywords": ["月経痛", "生理痛", "痛み悪化", "子宮内膜症"],
      "vector_tags": ["menstrual_pain", "dysmenorrhea", "severe", "worsening"]
    },
    {
      "id": "M7",
      "category": "免疫系",
      "category_en": "immune_system",
      "symptom": "花粉症・鼻炎・アトピーなどがある",
      "symptom_en": "hay_fever_rhinitis_atopy",
      "keywords": ["アレルギー", "花粉症", "鼻炎", "アトピー性皮膚炎"],
      "vector_tags": ["allergy", "hay_fever", "rhinitis", "atopy", "immune"]
    },
    {
      "id": "M8",
      "category": "免疫系",
      "category_en": "immune_system",
      "symptom": "アレルギーや自己免疫に関する不調がある",
      "symptom_en": "allergic_autoimmune_disorders",
      "keywords": ["自己免疫疾患", "アレルギー反応", "免疫異常", "炎症"],
      "vector_tags": ["autoimmune", "allergy", "immune_disorder", "inflammation"]
    }
  ],
  "traditional_medicine_elements": [
    {
      "id": "F1",
      "element": "気",
      "element_en": "qi",
      "symptom": "疲れやすく、だるさが取れない",
      "symptom_en": "easily_fatigued_persistent_lethargy",
      "keywords": ["疲労", "だるさ", "気虚", "エネルギー不足"],
      "vector_tags": ["fatigue", "qi_deficiency", "energy", "lethargy"]
    },
    {
      "id": "F2",
      "element": "気",
      "element_en": "qi",
      "symptom": "ため息が多く、やる気が出ない",
      "symptom_en": "frequent_sighing_lack_motivation",
      "keywords": ["気うつ", "ため息", "やる気なし", "気滞"],
      "vector_tags": ["sighing", "motivation", "qi_stagnation", "depression"]
    },
    {
      "id": "F3",
      "element": "気",
      "element_en": "qi",
      "symptom": "お腹が張りやすく、ガスがたまりやすい",
      "symptom_en": "abdominal_bloating_gas_accumulation",
      "keywords": ["腹部膨満", "ガス", "消化不良", "気滞"],
      "vector_tags": ["bloating", "gas", "digestive", "qi_stagnation"]
    },
    {
      "id": "F4",
      "element": "血",
      "element_en": "blood",
      "symptom": "顔色が悪く、肌が乾燥しやすい",
      "symptom_en": "poor_complexion_dry_skin",
      "keywords": ["血虚", "顔色不良", "肌乾燥", "血液不足"],
      "vector_tags": ["complexion", "dry_skin", "blood_deficiency", "pallor"]
    },
    {
      "id": "F5",
      "element": "血",
      "element_en": "blood",
      "symptom": "月経の血量が少ない／色が薄い",
      "symptom_en": "scanty_pale_menstrual_flow",
      "keywords": ["月経過少", "経血薄い", "血虚", "月経量減少"],
      "vector_tags": ["menstrual", "scanty", "pale", "blood_deficiency"]
    },
    {
      "id": "F6",
      "element": "血（瘀血）",
      "element_en": "blood_stasis",
      "symptom": "肩こり・冷え性・経血に塊がある",
      "symptom_en": "shoulder_stiffness_coldness_menstrual_clots",
      "keywords": ["瘀血", "血流停滞", "肩こり", "冷え性", "血塊"],
      "vector_tags": ["blood_stasis", "shoulder_stiffness", "coldness", "clots"]
    },
    {
      "id": "F7",
      "element": "血",
      "element_en": "blood",
      "symptom": "唇や爪の色が白っぽくなる",
      "symptom_en": "pale_lips_nails",
      "keywords": ["血虚", "唇白い", "爪白い", "貧血"],
      "vector_tags": ["pale", "lips", "nails", "blood_deficiency", "anemia"]
    },
    {
      "id": "F8",
      "element": "水",
      "element_en": "water",
      "symptom": "むくみやすく、身体が重だるい",
      "symptom_en": "easy_swelling_heavy_body",
      "keywords": ["水腫", "むくみ", "重だるさ", "水滞"],
      "vector_tags": ["swelling", "edema", "heavy", "water_retention"]
    },
    {
      "id": "F9",
      "element": "水",
      "element_en": "water",
      "symptom": "トイレが近い／汗が多い or 少ない",
      "symptom_en": "frequent_urination_abnormal_sweating",
      "keywords": ["頻尿", "発汗異常", "水代謝異常", "膀胱"],
      "vector_tags": ["urination", "sweating", "water_metabolism", "bladder"]
    },
    {
      "id": "F10",
      "element": "水（脾虚）",
      "element_en": "water_spleen_deficiency",
      "symptom": "舌の周りに歯の痕がつきやすい",
      "symptom_en": "teeth_marks_on_tongue",
      "keywords": ["脾虚", "舌診", "歯痕舌", "消化機能低下"],
      "vector_tags": ["tongue", "teeth_marks", "spleen_deficiency", "digestive"]
    },
    {
      "id": "F11",
      "element": "水（津液失調）",
      "element_en": "water_fluid_imbalance",
      "symptom": "のどが渇くのに水を飲みたくない",
      "symptom_en": "thirsty_but_no_desire_to_drink",
      "keywords": ["津液失調", "偽渇", "水分代謝異常", "のど渇き"],
      "vector_tags": ["thirst", "fluid_imbalance", "metabolism", "paradox"]
    },
    {
      "id": "F12",
      "element": "精（腎精）",
      "element_en": "essence_kidney",
      "symptom": "抜け毛や白髪が気になる",
      "symptom_en": "hair_loss_gray_hair",
      "keywords": ["腎精不足", "抜け毛", "白髪", "老化"],
      "vector_tags": ["hair_loss", "gray_hair", "kidney_essence", "aging"]
    },
    {
      "id": "F13",
      "element": "精",
      "element_en": "essence",
      "symptom": "眠りが浅く、夢をよく見る",
      "symptom_en": "light_sleep_frequent_dreams",
      "keywords": ["浅眠", "多夢", "精不足", "睡眠質低下"],
      "vector_tags": ["light_sleep", "dreams", "essence_deficiency", "sleep_quality"]
    },
    {
      "id": "F14",
      "element": "精",
      "element_en": "essence",
      "symptom": "老化や生殖力の衰えを感じる",
      "symptom_en": "aging_reproductive_decline",
      "keywords": ["老化", "生殖力低下", "腎精虚", "アンチエイジング"],
      "vector_tags": ["aging", "reproductive", "essence_deficiency", "fertility"]
    },
    {
      "id": "F15",
      "element": "精（腎虚）",
      "element_en": "essence_kidney_deficiency",
      "symptom": "耳鳴り・難聴・めまいがある",
      "symptom_en": "tinnitus_hearing_loss_dizziness",
      "keywords": ["腎虚", "耳鳴り", "難聴", "めまい"],
      "vector_tags": ["tinnitus", "hearing_loss", "dizziness", "kidney_deficiency"]
    },
    {
      "id": "F16",
      "element": "精（腎虚）",
      "element_en": "essence_kidney_deficiency",
      "symptom": "腰や膝に力が入らない・だるい",
      "symptom_en": "weak_lower_back_knees",
      "keywords": ["腎虚", "腰痛", "膝痛", "筋力低下"],
      "vector_tags": ["lower_back", "knees", "weakness", "kidney_deficiency"]
    }
  ],
  "category_mappings": {
    "functional_medicine": {
      "自律神経": ["M1", "M2", "M3", "M10", "M11"],
      "ホルモン": ["M4", "M5", "M6", "M12"],
      "免疫系": ["M7", "M8"]
    },
    "traditional_medicine": {
      "気": ["F1", "F2", "F3"],
      "血": ["F4", "F5", "F7"],
      "血（瘀血）": ["F6"],
      "水": ["F8", "F9"],
      "水（脾虚）": ["F10"],
      "水（津液失調）": ["F11"],
      "精（腎精）": ["F12"],
      "精": ["F13", "F14"],
      "精（腎虚）": ["F15", "F16"]
    }
  }
};

export function SymptomsSelectionScreen({ onComplete, language }: SymptomsSelectionScreenProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const content = {
    ja: {
      title: '未病診断ヒアリング',
      subtitle: '当てはまる症状を選択してください',
      symptomList: '症状一覧',
      symptomsCount: '件の症状',
      selectedCount: '件選択中',
      proceed: '診断結果を見る',
      minSelection: '最低1つの症状を選択してください'
    },
    en: {
      title: 'Mibyou Diagnosis Hearing',
      subtitle: 'Select symptoms that apply to you',
      symptomList: 'Symptom List',
      symptomsCount: 'symptoms',
      selectedCount: 'selected',
      proceed: 'View Diagnosis Results',
      minSelection: 'Please select at least one symptom'
    }
  };

  const t = content[language];

  const allSymptoms: SymptomItem[] = [
    ...medicalData.functional_medicine_categories,
    ...medicalData.traditional_medicine_elements
  ];

  const filteredSymptoms = useMemo(() => {
    if (activeFilters.length === 0) return allSymptoms;
    
    return allSymptoms.filter(symptom => {
      const category = 'category' in symptom ? symptom.category : symptom.element;
      return activeFilters.some(filter => 
        category.includes(filter) || category === filter
      );
    });
  }, [activeFilters]);

  const selectedSymptomsData = allSymptoms.filter(symptom => 
    selectedSymptoms.includes(symptom.id)
  );

  const handleSymptomSelect = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSelectedSymptoms([]);
  };

  const handleProceed = () => {
    if (selectedSymptoms.length > 0) {
      onComplete(selectedSymptoms);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 sticky top-4">
              <CategoryFilter 
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
                language={language}
              />
            </Card>
            
            {selectedSymptoms.length > 0 && (
              <SelectionResults 
                selectedSymptoms={selectedSymptomsData}
                onClearAll={handleClearAll}
                language={language}
              />
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t.symptomList}</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredSymptoms.length}{t.symptomsCount}
                  {selectedSymptoms.length > 0 && ` / ${selectedSymptoms.length}${t.selectedCount}`}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSymptoms.map(symptom => (
                  <SymptomCard
                    key={symptom.id}
                    symptom={symptom}
                    isSelected={selectedSymptoms.includes(symptom.id)}
                    onSelect={handleSymptomSelect}
                    categoryType={'category' in symptom ? 'functional' : 'traditional'}
                    language={language}
                  />
                ))}
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleProceed}
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-pink-500 hover:from-green-600 hover:to-pink-600 text-white"
                  >
                    {t.proceed} ({selectedSymptoms.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}