import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, badge }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconBg: 'bg-blue-600 text-white',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconBg: 'bg-purple-600 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-600 text-white',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconBg: 'bg-rose-600 text-white',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          {trend && (
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              {trend}
            </span>
          )}
          {badge && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${scheme.bg}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
