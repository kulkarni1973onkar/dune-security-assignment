

//-------------------------------------------Field & Form--------------------------------------------------------------------

export type FieldType = 'text' | 'multiple' | 'checkbox' | 'rating';

export type BaseField = {
  id: string;                 
  type: FieldType;
  label: string;
  required?: boolean;
  helpText?: string;
};

export type TextField = BaseField & {
  type: 'text';
  placeholder?: string;
  pattern?: string;           
  minLength?: number;
  maxLength?: number;
};

export type Option = { id: string; label: string; value: string };

export type MultipleField = BaseField & {
  type: 'multiple';
  options: Option[];
  allowOther?: boolean;
};

export type CheckboxField = BaseField & {
  type: 'checkbox';
  options: Option[];
};

export type RatingField = BaseField & {
  type: 'rating';
  min: number;     
  max: number;                
  step?: number;              
};

export type Field = TextField | MultipleField | CheckboxField | RatingField;

export type FormSchema = {
  _id?: string;               // MongoDB id from backend
  title: string;
  description?: string;
  slug?: string;              
  status: 'draft' | 'published' | 'archived';
  fields: Field[];
  createdAt?: string;
  updatedAt?: string;
};

// --------------------------------------Responses----------------------------------------------------------------------- 

export type Answer =
  | { fieldId: string; value: string }      
  | { fieldId: string; value: string[] }    
  | { fieldId: string; value: number };     

export type FormResponse = {
  formId: string;            
  submittedAt?: string;      
  answers: Answer[];
  meta?: { ua?: string; ip?: string }; 
};



export type OptionCount = { optionId: string; count: number };

export type FieldAnalytics =
  | {
      fieldId: string;
      type: 'text';
      topTerms: Array<{ term: string; count: number }>;
    }
  | {
      fieldId: string;
      type: 'multiple' | 'checkbox';
      distribution: OptionCount[]; // counts per optionId
    }
  | {
      fieldId: string;
      type: 'rating';
      avg: number;
      histogram: Array<{ score: number; count: number }>; 
    };

export type AnalyticsSnapshot = {
  formId: string;
  totalResponses: number;
  fields: FieldAnalytics[];
  updatedAt: string;
};
