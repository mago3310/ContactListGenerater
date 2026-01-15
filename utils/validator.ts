
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const Validators = {
  consent: (val: string): ValidationResult => {
    if (val === 'Y' || val === 'N') return { isValid: true };
    return { isValid: false, message: '欄位值須在 "Y" 或 "N" 內' };
  },

  mobile: (val: string, label: string): ValidationResult => {
    if (!/^09\d{8}$/.test(val)) {
      return { isValid: false, message: `${label}須為 09 開頭，數值長度為 10 位數` };
    }
    return { isValid: true };
  },

  phone: (val: string, label: string, mobileValue?: string): ValidationResult => {
    if (!/^(09|02)\d{8}$/.test(val)) {
      return { isValid: false, message: `${label}須為 09 或 02 開頭，數值長度為 10 位數` };
    }
    if (mobileValue && val === mobileValue) {
      return { isValid: false, message: `${label}不得與手機號碼重複` };
    }
    return { isValid: true };
  },

  idCard: (val: string): ValidationResult => {
    if (!/^[a-zA-Z0-9]+$/.test(val)) {
      return { isValid: false, message: '證號只能為大小寫的英文字母和數字' };
    }
    return { isValid: true };
  },

  name: (val: string): ValidationResult => {
    if (val.length > 20) {
      return { isValid: false, message: '姓名長度限定 20 個字以內' };
    }
    return { isValid: true };
  }
};
