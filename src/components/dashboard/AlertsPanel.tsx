import React from 'react';
import { AlertTriangle, CloudRain, Sun, Thermometer } from 'lucide-react';
import type { WeatherAlert } from '../../types';
import { clsx } from 'clsx';

interface AlertsPanelProps {
    alerts: WeatherAlert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-semibold text-gray-800">Risk Alerts</h3>
            </div>

            <div className="space-y-3">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className={clsx(
                            "p-4 rounded-xl border relative overflow-hidden transition-all hover:translate-y-[-2px] shadow-sm",
                            alert.severity === 'high' ? "bg-red-50 border-red-200" :
                                alert.severity === 'medium' ? "bg-amber-50 border-amber-200" :
                                    "bg-blue-50 border-blue-200"
                        )}
                    >
                        <div className="flex gap-3">
                            <div className={clsx(
                                "p-2 rounded-lg h-fit",
                                alert.severity === 'high' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                            )}>
                                {getAlertIcon(alert.type)}
                            </div>
                            <div>
                                <h4 className={clsx("font-semibold text-sm",
                                    alert.severity === 'high' ? "text-red-800" : "text-amber-800"
                                )}>
                                    {alert.type.replace('_', ' ').toUpperCase()} Risk
                                </h4>
                                <p className="text-sm text-gray-700 mt-1 leading-snug">
                                    {alert.message}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-600 bg-white/50 px-3 py-1.5 rounded-lg w-fit">
                                    <span>⚠️ {alert.suggestedAction}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getAlertIcon(type: string) {
    switch (type) {
        case 'heatwave': return <Sun className="w-5 h-5" />;
        case 'heavy_rain': return <CloudRain className="w-5 h-5" />;
        case 'frost': return <Thermometer className="w-5 h-5" />;
        default: return <AlertTriangle className="w-5 h-5" />;
    }
}
