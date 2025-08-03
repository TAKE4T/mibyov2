import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SymptomItem } from "../../types/medical-data";

interface SelectionResultsProps {
  selectedSymptoms: SymptomItem[];
  onClearAll: () => void;
  language: 'ja' | 'en';
}

export function SelectionResults({ selectedSymptoms, onClearAll, language }: SelectionResultsProps) {
  const content = {
    ja: {
      noSelection: '症状を選択してください',
      selectedSymptoms: '選択された症状',
      clearAll: 'すべてクリア',
      functionalMedicine: '機能医学',
      traditionalMedicine: '伝統医学',
      count: '件'
    },
    en: {
      noSelection: 'Please select symptoms',
      selectedSymptoms: 'Selected Symptoms',
      clearAll: 'Clear All',
      functionalMedicine: 'Functional Medicine',
      traditionalMedicine: 'Traditional Medicine',
      count: ''
    }
  };

  const t = content[language];

  if (selectedSymptoms.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        {t.noSelection}
      </Card>
    );
  }

  const functionalSymptoms = selectedSymptoms.filter(s => 'category' in s);
  const traditionalSymptoms = selectedSymptoms.filter(s => 'element' in s);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3>{t.selectedSymptoms} ({selectedSymptoms.length}{t.count})</h3>
        <button 
          onClick={onClearAll}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t.clearAll}
        </button>
      </div>

      {functionalSymptoms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-muted-foreground">{t.functionalMedicine}</h4>
          <div className="space-y-2">
            {functionalSymptoms.map(symptom => (
              <div key={symptom.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Badge variant="secondary">
                  {'category' in symptom ? symptom.category : symptom.element}
                </Badge>
                <span className="text-sm">
                  {language === 'ja' ? symptom.symptom : symptom.symptom_en}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {traditionalSymptoms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-muted-foreground">{t.traditionalMedicine}</h4>
          <div className="space-y-2">
            {traditionalSymptoms.map(symptom => (
              <div key={symptom.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Badge variant="secondary">
                  {'element' in symptom ? symptom.element : symptom.category}
                </Badge>
                <span className="text-sm">
                  {language === 'ja' ? symptom.symptom : symptom.symptom_en}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}