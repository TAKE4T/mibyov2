import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface Symptom {
  name: string;
  severity: "軽度" | "中度" | "重度";
  category: string;
}

interface SymptomPanelProps {
  symptoms: Symptom[];
  language: 'ja' | 'en';
}

export function SymptomPanel({ symptoms, language }: SymptomPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "軽度": return "bg-green-100 text-green-800";
      case "中度": return "bg-yellow-100 text-yellow-800";
      case "重度": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const content = {
    ja: {
      title: '現在の症状',
      characteristics: '症状の特徴',
      feature1: '慢性的な疲労感が続いている',
      feature2: '睡眠の質が低下している',
      feature3: 'ストレスによる影響が見られる'
    },
    en: {
      title: 'Current Symptoms',
      characteristics: 'Symptom Characteristics',
      feature1: 'Chronic fatigue persists',
      feature2: 'Sleep quality is declining',
      feature3: 'Stress-related effects are visible'
    }
  };

  const t = content[language];

  return (
    <Card className="p-4 h-full flex flex-col">
      <h2 className="mb-3 text-primary">{t.title}</h2>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {symptoms.map((symptom, index) => (
          <div key={index} className="border-l-4 border-primary pl-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm">{symptom.name}</h3>
              <Badge className={`${getSeverityColor(symptom.severity)} text-xs`}>
                {symptom.severity}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">{symptom.category}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-secondary rounded-lg">
        <h4 className="mb-2 text-sm">{t.characteristics}</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• {t.feature1}</li>
          <li>• {t.feature2}</li>
          <li>• {t.feature3}</li>
        </ul>
      </div>
    </Card>
  );
}