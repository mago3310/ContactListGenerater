
export enum FieldMode {
  RANDOM = 'RANDOM',
  FIXED = 'FIXED',
  STARTS_WITH = 'STARTS_WITH'
}

export interface FieldConfig {
  id: string;
  label: string;
  mode: FieldMode;
  fixedValue: string;
  error?: string;
  isHash?: boolean;
}

export interface GeneratedRow {
  id: string;
  consent: string;
  mobile: string;
  idCard: string;
  name: string;
  hashId: string;
  phone1: string;
  phone2: string;
  phone3: string;
  phone4: string;
}
