import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Leaf, AlertCircle, Clock, Info } from "lucide-react";

interface Herb {
  name: string;
  latin_name: string;
  effect: string;
  dosage: string;
  precautions: string[];
  compatibility: string;
  properties?: string[];
}

interface HerbPanelProps {
  herbs: Herb[];
  language: 'ja' | 'en';
  recipeName?: string;
}

export function HerbPanel({ herbs, language, recipeName = "配合生薬" }: HerbPanelProps) {
  const content = {
    ja: {
      title: '配合生薬',
      properties: '薬性',
      effects: '効能・効果',
      usage: '使用方法',
      precautions: '注意',
      other: '他',
      items: '件',
      steamTherapy: '蒸し療法について',
      steamDescription: 'これらの生薬を蒸気として体に作用させることで、皮膚から有効成分を吸収し、リラックス効果と睡眠改善をサポートします。',
      expertAdvice: '専門家からのアドバイス',
      consultationAdvice: '初回施術前にはカウンセリングを受け、体質や現在の健康状態を確認することをお勧めします。'
    },
    en: {
      title: 'Herbal Formula',
      properties: 'Properties',
      effects: 'Effects',
      usage: 'Usage',
      precautions: 'Precautions',
      other: 'other',
      items: 'items',
      steamTherapy: 'About Steam Therapy',
      steamDescription: 'These herbs work through steam to allow effective absorption through the skin, supporting relaxation and sleep improvement.',
      expertAdvice: 'Expert Advice',
      consultationAdvice: 'We recommend receiving counseling before your first treatment to check your constitution and current health condition.'
    }
  };

  const t = content[language];

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="h-4 w-4 text-primary" />
        <h2 className="text-primary">{t.title}</h2>
        <Badge variant="outline" className="text-xs">
          {recipeName}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {herbs.map((herb, index) => (
            <div key={index} className="space-y-2 border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <div>
                <h3 className="text-sm">{herb.name}</h3>
                <p className="text-xs text-muted-foreground italic">
                  {herb.latin_name}
                </p>
              </div>
              
              {herb.properties && herb.properties.length > 0 && (
                <div>
                  <h4 className="text-xs mb-1">{t.properties}</h4>
                  <div className="flex flex-wrap gap-1">
                    {herb.properties.map((property, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {property}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-xs mb-1">{t.effects}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {herb.effect}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs mb-1">{t.usage}</h4>
                <div className="flex items-start gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {herb.dosage}
                  </p>
                </div>
              </div>
              
              {herb.precautions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <h4 className="text-xs text-yellow-800">{t.precautions}</h4>
                  </div>
                  <ul className="text-xs text-yellow-700 space-y-0.5">
                    {herb.precautions.slice(0, 2).map((precaution, idx) => (
                      <li key={idx}>• {precaution}</li>
                    ))}
                    {herb.precautions.length > 2 && (
                      <li>• {t.other}{herb.precautions.length - 2}{t.items}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Info className="h-3 w-3 text-primary" />
            <h4 className="text-sm">{t.steamTherapy}</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.steamDescription}
          </p>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg">
          <h4 className="text-sm mb-1">{t.expertAdvice}</h4>
          <p className="text-xs text-muted-foreground">
            {t.consultationAdvice}
          </p>
        </div>
      </div>
    </Card>
  );
}