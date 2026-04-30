interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  bgColor: string;
  textColor?: string;
  subText?: string;
  subTextColor?: string;
}

export default function StatsCard({ label, value, icon, bgColor, textColor = 'text-gray-900', subText, subTextColor = 'text-gray-500' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {subText && <div className={`text-xs mt-1 ${subTextColor}`}>{subText}</div>}
      </div>
    </div>
  );
}
