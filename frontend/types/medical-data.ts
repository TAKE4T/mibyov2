export interface FunctionalMedicineCategory {
  id: string;
  category: string;
  category_en: string;
  symptom: string;
  symptom_en: string;
  keywords: string[];
  vector_tags: string[];
}

export interface TraditionalMedicineElement {
  id: string;
  element: string;
  element_en: string;
  symptom: string;
  symptom_en: string;
  keywords: string[];
  vector_tags: string[];
}

export interface MedicalData {
  functional_medicine_categories: FunctionalMedicineCategory[];
  traditional_medicine_elements: TraditionalMedicineElement[];
  category_mappings: {
    functional_medicine: Record<string, string[]>;
    traditional_medicine: Record<string, string[]>;
  };
}

export type SymptomItem = FunctionalMedicineCategory | TraditionalMedicineElement;