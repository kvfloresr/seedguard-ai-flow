import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, FileText, Activity } from "lucide-react";
import AnalysisDetailsModal from "./AnalysisDetailsModal";

interface Report {
analysis_id: string;
predicted_class: string;
probability: number;
probability_vector?: number[];
features?: Record<string, any>;
processed_at?: string;
captured_at?: string;
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
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
});
};

interface Props {
onBackToDashboard: () => void;
}

const AnalysisHistory = ({ onBackToDashboard }: Props) => {
const [reports, setReports] = useState<Report[]>([]);
const [loading, setLoading] = useState(true);
const [query, setQuery] = useState("");

useEffect(() => {
    const fetchReports = async () => {
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/analyses?limit=500`);
        if (res.ok) setReports(await res.json());
    } catch (e) {
        console.error("Error cargando análisis:", e);
    } finally {
        setLoading(false);
    }
    };
    fetchReports();
}, []);

const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
    const label = (CLASS_LABELS[r.predicted_class] ?? r.predicted_class ?? "").toLowerCase();
    return label.includes(q) ||
        (r.predicted_class ?? "").toLowerCase().includes(q) ||
        (r.processed_at ?? "").toLowerCase().includes(q);
    });
}, [reports, query]);

return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
    <nav className="bg-green-600 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a className="text-xl font-bold">SeedDSS</a>
        <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="text-white hover:bg-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
        </Button>
        </div>
    </nav>

    <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-green-700">Análisis Realizados</h1>
            <p className="text-muted-foreground">Historial completo de verificaciones del sistema</p>
        </div>
        </div>

        {/* Buscador */}
        <div className="relative max-w-md my-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
            placeholder="Buscar por clase o fecha..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
        />
        </div>

        <Card className="shadow-lg">
        <CardContent className="p-6">
            {loading ? (
            <p className="text-center py-12 text-muted-foreground">Cargando análisis...</p>
            ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
                <p className="text-sm text-muted-foreground mb-3">
                {filtered.length} análisis{query ? " encontrados" : " en total"}
                </p>
                <Table>
                <TableHeader>
                    <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Clase Predicha</TableHead>
                    <TableHead className="font-semibold">Confianza</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.map((r, i) => (
                    <TableRow key={r.analysis_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                        <Badge variant={r.probability > 0.8 ? "default" : "secondary"}>
                            {CLASS_LABELS[r.predicted_class] ?? r.predicted_class}
                        </Badge>
                        </TableCell>
                        <TableCell>{(r.probability * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-sm">{fmtDate(r.processed_at)}</TableCell>
                        <TableCell className="text-right">
                        <AnalysisDetailsModal analysis={r} />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            ) : (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                {query ? "No hay análisis que coincidan con la búsqueda." : "Aún no hay análisis registrados."}
                </p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default AnalysisHistory;