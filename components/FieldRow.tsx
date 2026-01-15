
import React from 'react';
import { FieldConfig, FieldMode } from '../types';

interface FieldRowProps {
  config: FieldConfig;
  onChange: (id: string, updates: Partial<FieldConfig>) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ config, onChange }) => {
  const isHash = config.isHash;
  const isNameField = config.id === 'name';

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 border-b border-slate-800 last:border-0">
      <div className="w-full md:w-1/4">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {config.label}
        </label>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative inline-block w-40">
          <select
            disabled={isHash}
            value={config.mode}
            onChange={(e) => onChange(config.id, { mode: e.target.value as FieldMode })}
            className={`w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 transition-all ${isHash ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value={FieldMode.RANDOM}>隨機產生</option>
            <option value={FieldMode.FIXED}>固定數值</option>
            {isNameField && <option value={FieldMode.STARTS_WITH}>開始於</option>}
          </select>
          {!isHash && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          )}
        </div>

        <div className="flex-1 w-full relative">
          <input
            type="text"
            disabled={isHash || config.mode === FieldMode.RANDOM}
            placeholder={
              isHash 
                ? "自動根據證號生成" 
                : config.mode === FieldMode.RANDOM 
                  ? "系統自動隨機生成" 
                  : config.mode === FieldMode.STARTS_WITH 
                    ? "輸入字首 (例如: Test)" 
                    : "請輸入固定值"
            }
            value={config.fixedValue}
            onChange={(e) => onChange(config.id, { fixedValue: e.target.value })}
            className={`w-full bg-slate-800 border px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 text-slate-200
              ${config.error ? 'border-red-500/50 focus:ring-red-500 bg-red-500/5' : 'border-slate-700 focus:ring-indigo-500'}
              disabled:bg-slate-900 disabled:text-slate-600`}
          />
          {config.error && (
            <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>失敗：{config.error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldRow;
