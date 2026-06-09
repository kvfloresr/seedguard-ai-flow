import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Calendar, Cpu } from "lucide-react";
import SeedMorphologyPanels from "./wizard-steps/SeedMorphologyPanels";

interface IniafIndicator {
name: string;
value: string | number;
threshold: string;
pass: boolean;
icon: string;
}
interface DistItem {
class: string;
label_es?: string;
count: number;
percentage: number;
color?: string;
}
interface Iniaf {
certifiable?: boolean;
certification_level?: string;
certification_reasons?: string[];
total_analyzed?: number;
indicators?: IniafIndicator[];
distribution?: DistItem[];
per_seed?: any[];
}
interface Report {
analysis_id: string;
predicted_class: string;
probability: number;
features?: Record<string, any>;
processed_at?: string;
iniaf?: Iniaf;
}

const CLASS_LABELS: Record<string, string> = {
"Intact soybeans": "Intactas",
"Broken soybeans": "Quebradas / Rotas",
"Immature soybeans": "Inmaduras",
"Skin-damaged soybeans": "Cubierta dañada",
"Spotted soybeans": "Manchadas",
};

const fmtDate = (s?: string) => {
if (!s) return "—";
const d = new Date(s.replace(" ", "T"));
if (isNaN(d.getTime())) return s;
return d.toLocaleString("es-ES", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
});
};

const flattenFeatures = (features?: Record<string, any>): [string, any][] => {
if (!features) return [];
const entries = Object.entries(features);
if (entries.length === 1 && typeof entries[0][1] === "object" && entries[0][1] !== null) {
    return Object.entries(entries[0][1] as Record<string, any>);
}
const firstObj = entries.find(([, v]) => typeof v === "object" && v !== null);
if (firstObj) return Object.entries(firstObj[1] as Record<string, any>);
return entries;
};

const AnalysisDetailsModal = ({ analysis }: { analysis: Report }) => {
const iniaf = analysis.iniaf;
const hasIniaf = !!iniaf && (
    (iniaf.per_seed && iniaf.per_seed.length > 0) ||
    (iniaf.indicators && iniaf.indicators.length > 0)
);
const features = flattenFeatures(analysis.features);

return (
    <Dialog>
    <DialogTrigger asChild>
        <Button variant="outline" size="sm">
        <Eye className="w-4 h-4 mr-2" />
        Ver Detalles
        </Button>
    </DialogTrigger>
    <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
        <DialogTitle className="text-2xl">Detalle del Análisis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
        {/* ===== VEREDICTO DE CERTIFICACIÓN INIAF ===== */}
        {hasIniaf && (
            <Card className="p-5 border-2" style={{ borderColor: iniaf!.certifiable ? "#22c55e" : "#ef4444" }}>
            <div className={`flex items-center gap-4 p-4 rounded-lg ${
                iniaf!.certifiable ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
                iniaf!.certifiable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                {iniaf!.certifiable ? "✓" : "✗"}
                </div>
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Certificación INIAF 2022 · {iniaf!.total_analyzed ?? 0} semillas analizadas
                </p>
                <p className={`text-xl font-bold ${iniaf!.certifiable ? "text-green-700" : "text-red-700"}`}>
                    {iniaf!.certification_level}
                </p>
                </div>
            </div>

            {/* Tabla de indicadores */}
            {iniaf!.indicators && iniaf!.indicators.length > 0 && (
                <div className="mt-5 rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-3 font-semibold">Indicador</th>
                        <th className="text-center p-3 font-semibold">Valor</th>
                        <th className="text-center p-3 font-semibold">Norma INIAF</th>
                        <th className="text-center p-3 font-semibold">Estado</th>
                    </tr>
                    </thead>
                    <tbody>
                    {iniaf!.indicators.map((ind, i) => (
                        <tr key={i} className={`border-t ${ind.pass ? "" : "bg-red-50"}`}>
                        <td className="p-3 font-medium">{ind.name}</td>
                        <td className="p-3 text-center font-bold">
                            {typeof ind.value === "number" ? `${ind.value}%` : ind.value}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">{ind.threshold}</td>
                        <td className={`p-3 text-center text-lg font-bold ${ind.pass ? "text-green-600" : "text-red-600"}`}>
                            {ind.icon}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}

            {/* Distribución por clase */}
            {iniaf!.distribution && iniaf!.distribution.length > 0 && (
                <div className="mt-5 space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Distribución por categoría de calidad
                </h4>
                {iniaf!.distribution.map((item) => (
                    <div key={item.class}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.label_es ?? item.class}</span>
                        <span className="text-muted-foreground">
                        {item.count} sem. — <strong>{item.percentage.toFixed(1)}%</strong>
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div className="h-4 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(item.percentage, item.percentage > 0 ? 4 : 0)}%`, backgroundColor: item.color ?? "#888" }} />
                    </div>
                    </div>
                ))}
                </div>
            )}
            </Card>
        )}

        {/* ===== ANÁLISIS MORFOLÓGICO POR SEMILLA (mismo componente del informe) ===== */}
        {hasIniaf && iniaf!.per_seed && iniaf!.per_seed.length > 0 && (
            <SeedMorphologyPanels result={{ perSeed: iniaf!.per_seed, overlayImages: [] } as any} />
        )}

        {/* ===== Si NO hay datos INIAF guardados: vista simple de respaldo ===== */}
        {!hasIniaf && (
            <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Clase predicha</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-2xl font-bold">{CLASS_LABELS[analysis.predicted_class] ?? analysis.predicted_class}</span>
                <Badge variant="secondary">Confianza del modelo: {(analysis.probability * 100).toFixed(1)}%</Badge>
            </div>
            <Progress value={analysis.probability * 100} className="h-3 mt-3" />
            <p className="text-xs text-muted-foreground mt-3">
                Este análisis se realizó antes de activar la certificación INIAF, por eso no incluye el desglose por semilla.
            </p>
            </Card>
        )}

        {/* ===== Metadatos ===== */}
        <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">Fecha de procesamiento</p>
                <p className="font-medium">{fmtDate(analysis.processed_at)}</p>
            </div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">Identificador</p>
                <p className="font-medium text-sm truncate">{analysis.analysis_id}</p>
            </div>
            </Card>
        </div>

        {/* ===== Características morfológicas globales (si las hay) ===== */}
        {features.length > 0 && (
            <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Características generales de la muestra
            </h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {features.map(([k, v]) => (
                <Card key={k} className="p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-bold">{typeof v === "number" ? v.toFixed(2) : String(v)}</p>
                </Card>
                ))}
            </div>
            </div>
        )}
        </div>
    </DialogContent>
    </Dialog>
);
};

export default AnalysisDetailsModal;