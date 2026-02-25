import React from 'react';
import { useUserStore } from '../store/userStore';
import { cn } from '../lib/utils';
import { Settings as SettingsIcon, Palette, Globe, Shield, Bell, Database, Save } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useUserStore();

  const themes: { id: any; label: string; color: string }[] = [
    { id: 'clinic', label: 'FitWhite Pink', color: 'bg-pink-500' },
    { id: 'light', label: 'Clean Light', color: 'bg-slate-200' },
    { id: 'dark', label: 'Deep Dark', color: 'bg-slate-900' },
    { id: 'neopos', label: 'Neo POS', color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight">System Settings</h2>
        <p className="text-slate-500 text-sm font-medium">Configure your POS environment and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
            { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
            { id: 'network', label: 'Network & Sync', icon: <Globe size={18} /> },
            { id: 'security', label: 'Security', icon: <Shield size={18} /> },
            { id: 'database', label: 'Database', icon: <Database size={18} /> }
          ].map(item => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                item.id === 'appearance' 
                  ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className={cn(
            "p-8 rounded-3xl border",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          )}>
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
              <Palette size={20} className="text-slate-400" />
              Appearance Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Interface Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                        theme === t.id 
                          ? (theme === 'clinic' ? "border-pink-500 bg-pink-50/50" : "border-emerald-500 bg-emerald-50/50")
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-full shadow-inner", t.color)} />
                      <span className="text-sm font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Compact Mode</h4>
                    <p className="text-xs text-slate-500">Reduce padding and font sizes for high-density screens.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-3xl border",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          )}>
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
              <Globe size={20} className="text-slate-400" />
              Network & Synchronization
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Auto-Sync Offline Sales</h4>
                  <p className="text-xs text-slate-500">Automatically upload sales when internet is restored.</p>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                  theme === 'clinic' ? "bg-pink-600" : "bg-emerald-600"
                )}>
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <button className={cn(
                "w-full py-3 rounded-xl border-2 border-dashed font-bold text-xs uppercase tracking-widest transition-all",
                theme === 'clinic' ? "border-pink-200 text-pink-600 hover:bg-pink-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              )}>
                Force Manual Sync
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button className={cn(
              "px-8 py-4 rounded-2xl font-black text-white shadow-xl flex items-center gap-2 transition-all active:scale-95",
              theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
            )}>
              <Save size={20} />
              SAVE ALL CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
