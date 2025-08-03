import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { SymptomItem } from "../../types/medical-data";

interface SymptomCardProps {
  symptom: SymptomItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  categoryType: 'functional' | 'traditional';
  language: 'ja' | 'en';
}

const categoryColors = {
  functional: {
    '自律神経': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    'ホルモン': 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    '免疫系': 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  traditional: {
    '気': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    '血': 'bg-red-50 border-red-200 hover:bg-red-100',
    '血（瘀血）': 'bg-red-50 border-red-200 hover:bg-red-100',
    '水': 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    '水（脾虚）': 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    '水（津液失調）': 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    '精': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    '精（腎精）': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    '精（腎虚）': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  }
};

const badgeColors = {
  functional: {
    '自律神経': 'bg-blue-100 text-blue-800',
    'ホルモン': 'bg-pink-100 text-pink-800',
    '免疫系': 'bg-green-100 text-green-800',
  },
  traditional: {
    '気': 'bg-yellow-100 text-yellow-800',
    '血': 'bg-red-100 text-red-800',
    '血（瘀血）': 'bg-red-100 text-red-800',
    '水': 'bg-cyan-100 text-cyan-800',
    '水（脾虚）': 'bg-cyan-100 text-cyan-800',
    '水（津液失調）': 'bg-cyan-100 text-cyan-800',
    '精': 'bg-purple-100 text-purple-800',
    '精（腎精）': 'bg-purple-100 text-purple-800',
    '精（腎虚）': 'bg-purple-100 text-purple-800',
  }
};

export function SymptomCard({ symptom, isSelected, onSelect, categoryType, language }: SymptomCardProps) {
  const category = 'category' in symptom ? symptom.category : symptom.element;
  const cardColor = categoryColors[categoryType][category] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  const badgeColor = badgeColors[categoryType][category] || 'bg-gray-100 text-gray-800';
  
  const symptomText = language === 'ja' ? symptom.symptom : symptom.symptom_en;

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 ${cardColor} ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={() => onSelect(symptom.id)}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected}
          onChange={() => onSelect(symptom.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="leading-relaxed">{symptomText}</p>
            <Badge variant="secondary" className={`${badgeColor} shrink-0`}>
              {category}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {symptom.keywords.slice(0, 3).map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-white/60 rounded text-xs text-gray-600">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}