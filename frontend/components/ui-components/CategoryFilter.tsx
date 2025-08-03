import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface CategoryFilterProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  language: 'ja' | 'en';
}

const categories = {
  functional: {
    label: { ja: '機能医学', en: 'Functional Medicine' },
    items: ['自律神経', 'ホルモン', '免疫系']
  },
  traditional: {
    label: { ja: '伝統医学', en: 'Traditional Medicine' },
    items: ['気', '血', '水', '精']
  }
};

export function CategoryFilter({ activeFilters, onFilterChange, language }: CategoryFilterProps) {
  const toggleFilter = (category: string) => {
    if (activeFilters.includes(category)) {
      onFilterChange(activeFilters.filter(f => f !== category));
    } else {
      onFilterChange([...activeFilters, category]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const content = {
    ja: {
      title: 'カテゴリフィルター',
      clearAll: 'すべてクリア'
    },
    en: {
      title: 'Category Filter',
      clearAll: 'Clear All'
    }
  };

  const t = content[language];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>{t.title}</h3>
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {t.clearAll}
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {Object.entries(categories).map(([type, { label, items }]) => (
          <div key={type} className="space-y-2">
            <h4 className="text-sm text-muted-foreground">{label[language]}</h4>
            <div className="flex flex-wrap gap-2">
              {items.map(category => (
                <Badge
                  key={category}
                  variant={activeFilters.includes(category) ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleFilter(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}