import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, Target, Droplets, AlertTriangle } from "lucide-react";

interface Recipe {
  recipe_id: string;
  name: string;
  name_en: string;
  primary_actions: string[];
  primary_actions_en: string[];
  herbs: Array<{
    name: string;
    name_en: string;
    properties: string[];
  }>;
  target_conditions: string[];
  target_symptoms: string[];
  keywords: string[];
  vector_tags: string[];
  treatment_approach: string;
  contraindications: string[];
  session_duration: string;
  recommended_frequency: string;
}

interface SolutionPanelProps {
  recipe: Recipe;
  language: 'ja' | 'en';
}

export function SolutionPanel({ recipe, language }: SolutionPanelProps) {
  const content = {
    ja: {
      title: '推奨治療法',
      sessionTime: '施術時間',
      frequency: '推奨頻度',
      targetSymptoms: '対象症状',
      precautions: '注意事項',
      avoid: 'の方は使用を避けてください'
    },
    en: {
      title: 'Recommended Treatment',
      sessionTime: 'Session Time',
      frequency: 'Recommended Frequency',
      targetSymptoms: 'Target Symptoms',
      precautions: 'Precautions',
      avoid: ' should avoid use'
    }
  };

  const t = content[language];
  const recipeName = language === 'ja' ? recipe.name : recipe.name_en;
  const actions = language === 'ja' ? recipe.primary_actions : recipe.primary_actions_en;

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="h-4 w-4 text-primary" />
        <h2 className="text-primary">{t.title}</h2>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="border rounded-lg p-3 bg-primary/5">
          <h3 className="text-sm mb-2">{recipeName}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {recipe.treatment_approach}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {actions.map((action, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {action}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t.sessionTime}: {recipe.session_duration}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{t.frequency}: {recipe.recommended_frequency}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs mb-2">{t.targetSymptoms}</h4>
          <div className="flex flex-wrap gap-1">
            {recipe.target_symptoms.slice(0, 4).map((symptom, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {symptom}
              </Badge>
            ))}
            {recipe.target_symptoms.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.target_symptoms.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {recipe.contraindications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <h4 className="text-xs text-yellow-800">{t.precautions}</h4>
            </div>
            <ul className="text-xs text-yellow-700 space-y-0.5">
              {recipe.contraindications.map((contraindication, index) => (
                <li key={index}>• {contraindication}{t.avoid}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}