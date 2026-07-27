import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { X, Database, CheckCircle2, Copy, AlertTriangle, ExternalLink, ShieldCheck, Code } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const sqlCode = `-- Supabase Realtime Setup for Buffet Fadi
-- Copy and paste this script in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_office TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_reference TEXT,
  payment_gateway TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  notes TEXT,
  chat_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'موظف بوفيه',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO staff (id, name, username, password, role, status)
VALUES ('staff-admin', 'مدير النظام الافتراضي', 'admin', 'admin123', 'مشرف البوفيه', 'active')
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  customization_group_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buffet_status (
  id TEXT PRIMARY KEY DEFAULT 'main',
  is_open BOOLEAN DEFAULT true,
  closure_reason TEXT DEFAULT '',
  reopen_time TEXT DEFAULT '',
  auto_schedule_enabled BOOLEAN DEFAULT false,
  working_hours JSONB DEFAULT '{"openHour": "06:00", "closeHour": "23:59"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO buffet_status (id, is_open) VALUES ('main', true) ON CONFLICT (id) DO NOTHING;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE buffet_status;

-- Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE buffet_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_policy" ON orders FOR ALL USING (true);
CREATE POLICY "staff_policy" ON staff FOR ALL USING (true);
CREATE POLICY "menu_policy" ON menu_items FOR ALL USING (true);
CREATE POLICY "buffet_policy" ON buffet_status FOR ALL USING (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl overflow-hidden border border-slate-100 flex flex-col dir-rtl text-right">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>إعدادات وقاعدة بيانات Supabase Realtime</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                ربط المزامنة الفورية للطلبات والموظفين وقاعدة البيانات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <h3 className="font-extrabold text-sm">
                {isConfigured
                  ? '🟢 اتصال Supabase مفعل وجاهز للمزامنة الفورية!'
                  : '⚡ النظام يعمل بنمط المزامنة المحلية وتخزين المحاكاة'}
              </h3>
              <p className="leading-relaxed opacity-90">
                {isConfigured
                  ? 'تم العثور على VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY. المزامنة الفورية شغالة تلقائياً.'
                  : 'لتفعيل المزامنة المباشرة الحية مع قاعدة بيانات Supabase الخارجية عبر أكثر من جهاز، يمكنك إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env.'}
              </p>
            </div>
          </div>

          {/* SQL Setup Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>سكربت إنشاء الجداول وتفعيل Realtime في Supabase</span>
              </h3>
              <button
                onClick={copySql}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-56 dir-ltr text-left border border-slate-800 leading-relaxed select-all">
              <pre>{sqlCode}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
