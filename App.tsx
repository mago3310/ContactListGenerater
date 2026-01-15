
import React, { useState, useCallback, useEffect } from 'react';
import { FieldConfig, FieldMode, GeneratedRow } from './types';
import FieldRow from './components/FieldRow';
import { Validators, ValidationResult } from './utils/validator';
import { generateRandomConsent, generateRandomPhone, generateRandomID, generateRandomName } from './utils/generator';
import { sha256 } from './utils/crypto';

const INITIAL_CONFIG: FieldConfig[] = [
  { id: 'consent', label: '同意第三方行銷', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'mobile', label: '手機號碼', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'idCard', label: '證號', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'name', label: '姓名', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'hashId', label: 'hash證號', mode: FieldMode.RANDOM, fixedValue: '', isHash: true },
  { id: 'phone1', label: '電話1', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'phone2', label: '電話2', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'phone3', label: '電話3', mode: FieldMode.RANDOM, fixedValue: '' },
  { id: 'phone4', label: '電話4', mode: FieldMode.RANDOM, fixedValue: '' },
];

const App: React.FC = () => {
  const [configs, setConfigs] = useState<FieldConfig[]>(INITIAL_CONFIG);
  const [rowCount, setRowCount] = useState<number>(10);
  const [results, setResults] = useState<GeneratedRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFieldChange = (id: string, updates: Partial<FieldConfig>) => {
    setConfigs(prev => prev.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        if (updates.mode !== undefined || updates.fixedValue !== undefined) {
          next.error = undefined;
        }
        return next;
      }
      return c;
    }));
  };

  useEffect(() => {
    const validate = async () => {
      const mobileConfig = configs.find(c => c.id === 'mobile');
      const mobileVal = mobileConfig?.mode === FieldMode.FIXED ? mobileConfig.fixedValue : '';

      const updated = [...configs];
      let hasChanges = false;

      for (let i = 0; i < updated.length; i++) {
        const config = updated[i];
        // Validate if FIXED or STARTS_WITH (which also uses fixedValue for input)
        const isInputActive = config.mode === FieldMode.FIXED || config.mode === FieldMode.STARTS_WITH;
        
        if (isInputActive && config.fixedValue && !config.isHash) {
          let res: ValidationResult = { isValid: true };
          
          switch (config.id) {
            case 'consent': res = Validators.consent(config.fixedValue); break;
            case 'mobile': res = Validators.mobile(config.fixedValue, '手機號碼'); break;
            case 'idCard': res = Validators.idCard(config.fixedValue); break;
            case 'name': res = Validators.name(config.fixedValue); break;
            case 'phone1':
            case 'phone2':
            case 'phone3':
            case 'phone4':
              res = Validators.phone(config.fixedValue, config.label, mobileVal);
              break;
          }

          if (!res.isValid && updated[i].error !== res.message) {
            updated[i] = { ...updated[i], error: res.message };
            hasChanges = true;
          } else if (res.isValid && updated[i].error) {
            updated[i] = { ...updated[i], error: undefined };
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        setConfigs(updated);
      }
    };

    validate();
  }, [configs]);

  const handleGenerate = async () => {
    const inputActiveConfigs = configs.filter(c => c.mode === FieldMode.FIXED || c.mode === FieldMode.STARTS_WITH);
    const errors = inputActiveConfigs.filter(c => c.error);
    
    if (errors.length > 0) {
      alert('請先修正欄位驗證錯誤再產生名單');
      return;
    }

    setIsGenerating(true);
    const newResults: GeneratedRow[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: Partial<GeneratedRow> = { id: (i + 1).toString() };

      // Consent
      const consentConf = configs.find(c => c.id === 'consent')!;
      row.consent = consentConf.mode === FieldMode.RANDOM ? generateRandomConsent() : consentConf.fixedValue;

      // ID Card
      const idCardConf = configs.find(c => c.id === 'idCard')!;
      row.idCard = idCardConf.mode === FieldMode.RANDOM ? generateRandomID() : idCardConf.fixedValue;

      // Name
      const nameConf = configs.find(c => c.id === 'name')!;
      if (nameConf.mode === FieldMode.RANDOM) {
        row.name = generateRandomName();
      } else if (nameConf.mode === FieldMode.FIXED) {
        row.name = nameConf.fixedValue;
      } else if (nameConf.mode === FieldMode.STARTS_WITH) {
        // Requirement: Prefix-RandomName
        row.name = `${nameConf.fixedValue}-${generateRandomName()}`;
      }

      // Mobile
      const mobileConf = configs.find(c => c.id === 'mobile')!;
      row.mobile = mobileConf.mode === FieldMode.RANDOM 
        ? generateRandomPhone(['09']) 
        : mobileConf.fixedValue;

      // Hash ID
      row.hashId = await sha256(row.idCard || '');

      // Phone fields
      const usedPhones = [row.mobile || ''];
      const phoneIds = ['phone1', 'phone2', 'phone3', 'phone4'] as const;
      
      phoneIds.forEach(pid => {
        const conf = configs.find(c => c.id === pid)!;
        const val = conf.mode === FieldMode.RANDOM 
          ? generateRandomPhone(['09', '02'], usedPhones) 
          : conf.fixedValue;
        row[pid] = val;
        usedPhones.push(val);
      });

      newResults.push(row as GeneratedRow);
    }

    setResults(newResults);
    setIsGenerating(false);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    
    const headers = ["同意第三方行銷", "手機號碼", "證號", "姓名", "hash證號", "電話1", "電話2", "電話3", "電話4"];
    const rows = results.map(r => [
      r.consent, r.mobile, r.idCard, r.name, r.hashId, r.phone1, r.phone2, r.phone3, r.phone4
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "generated_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          <i className="fa-solid fa-list-check text-indigo-400 mr-3"></i>
          名單產生器
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-indigo-400"></i>
                欄位設定與規則
              </h2>
            </div>
            <div className="p-6 divide-y divide-slate-800">
              {configs.map(config => (
                <FieldRow key={config.id} config={config} onChange={handleFieldChange} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 sticky top-8">
            <h2 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-gear text-indigo-400"></i>
              產生選項
            </h2>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-400 mb-2">產生筆數</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-lg font-bold text-indigo-400 w-16 text-right">{rowCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 group"
              >
                {isGenerating ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i>
                )}
                產生資料名單
              </button>
              
              <button
                onClick={handleExport}
                disabled={results.length === 0}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:border-slate-800 disabled:text-slate-600 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-file-export"></i>
                匯出 CSV 檔案
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">上次產生筆數</span>
                  <span className="font-semibold text-slate-300">{results.length} 筆</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-12 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800">
            <h2 className="font-bold text-slate-200 flex items-center gap-2">
              <i className="fa-solid fa-table text-indigo-400"></i>
              預覽產出資料 (前 10 筆)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800/30 text-slate-400 font-medium border-b border-slate-800">
                  <th className="px-6 py-4">同意行銷</th>
                  <th className="px-6 py-4">手機</th>
                  <th className="px-6 py-4">證號</th>
                  <th className="px-6 py-4">姓名</th>
                  <th className="px-6 py-4">Hash證號</th>
                  <th className="px-6 py-4">電話1</th>
                  <th className="px-6 py-4">電話2</th>
                  <th className="px-6 py-4">電話3</th>
                  <th className="px-6 py-4">電話4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/50 transition-colors text-slate-300">
                    <td className="px-6 py-4 font-mono">{row.consent}</td>
                    <td className="px-6 py-4 font-mono">{row.mobile}</td>
                    <td className="px-6 py-4 font-mono">{row.idCard}</td>
                    <td className="px-6 py-4">{row.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[120px]" title={row.hashId}>
                      {row.hashId}
                    </td>
                    <td className="px-6 py-4 font-mono">{row.phone1}</td>
                    <td className="px-6 py-4 font-mono">{row.phone2}</td>
                    <td className="px-6 py-4 font-mono">{row.phone3}</td>
                    <td className="px-6 py-4 font-mono">{row.phone4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > 10 && (
            <div className="px-6 py-3 bg-slate-800/50 text-center text-xs text-slate-500">
              還有 {results.length - 10} 筆資料未顯示，請點擊「匯出 CSV」查看完整內容。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
