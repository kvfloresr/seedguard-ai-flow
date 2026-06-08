import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText, RefreshCw, User, Package, FlaskConical,
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle,
} from "lucide-react";
import { AnalysisResult, ProducerData, LoteData, SampleData } from "../SeedVerificationWizard";
import SeedMorphologyPanels from "./SeedMorphologyPanels";

interface FinalReportProps {
  result: AnalysisResult;
  producerData: ProducerData;
  loteData: LoteData;
  sampleData: SampleData;
  onNewVerification: () => void;
}

const FinalReport = ({
  result,
  producerData,
  loteData,
  sampleData,
  onNewVerification,
}: FinalReportProps) => {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Datos INIAF (única fuente de verdad, consistente con la pantalla de Resultados)
  const certifiable = !!result.certifiable;
  const indicators = result.iniafIndicators ?? [];
  const distribution = result.classDistribution ?? [];
  const reasons = result.certificationReasons ?? [];
  const totalAnalyzed =
    result.totalAnalyzed ?? distribution.reduce((s, d) => s + d.count, 0);

  const handleDownloadPDF = async () => {
    const analysis_id = localStorage.getItem("latest_analysis_id");
    if (!analysis_id) {
      alert("No existe informe disponible");
      return;
    }
    try {
      const base = import.meta.env.VITE_API_URL;
      const res = await fetch(`${base}/api/download_report/${analysis_id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Error descargando PDF");
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Reporte_${analysis_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error(error);
      alert("Error al descargar PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Informe Final de Verificación</h2>
        <p className="text-muted-foreground">
          Reporte completo del análisis de calidad de semillas
        </p>
        <p className="text-sm text-muted-foreground">Generado el {currentDate}</p>
      </div>

      <Separator />

      {/* Información del productor */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información del Productor</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{producerData.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Código de Productor</p>
            <p className="font-medium">{producerData.cod_producer}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-medium">{producerData.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{producerData.address}</p>
          </div>
        </div>
      </Card>

      {/* Lote */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información del Lote</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Semilla</p>
            <p className="font-medium">{loteData.seedType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Cosecha</p>
            <p className="font-medium">
              {new Date(loteData.harvestDate).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
      </Card>

      {/* Muestra */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información de la Muestra</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Muestreo</p>
            <p className="font-medium">
              {new Date(sampleData.samplingDate).toLocaleDateString("es-ES")}
            </p>
          </div>
          {sampleData.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="font-medium">{sampleData.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Separator />

      {/* ===== Veredicto de certificación INIAF (reemplaza Evaluación de Calidad) ===== */}
      <Card
        className="overflow-hidden border-2"
        style={{ borderColor: certifiable ? "#22c55e" : "#ef4444" }}
      >
        <div
          className={`p-6 md:p-8 ${
            certifiable
              ? "bg-gradient-to-br from-green-50 to-emerald-50"
              : "bg-gradient-to-br from-red-50 to-rose-50"
          }`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                certifiable ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {certifiable ? (
                <ShieldCheck className="w-11 h-11 text-green-600" />
              ) : (
                <ShieldAlert className="w-11 h-11 text-red-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Certificación INIAF 2022 · {totalAnalyzed} semillas analizadas
              </p>
              <h3
                className={`text-2xl md:text-3xl font-bold leading-tight ${
                  certifiable ? "text-green-700" : "text-red-700"
                }`}
              >
                {result.certificationLevel ??
                  (certifiable
                    ? "Apto para certificación INIAF"
                    : "No certificable — No cumple norma INIAF 2022")}
              </h3>
              {!certifiable && reasons.length > 0 && (
                <p className="text-sm text-red-700/80 mt-2">
                  No cumple en: {reasons.join("  ·  ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Indicadores INIAF */}
      {indicators.length > 0 && (
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Indicadores de calidad física · Tabla 3.1 INIAF
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((ind, i) => (
              <div
                key={i}
                className={`relative rounded-xl border p-4 pl-5 ${
                  ind.pass ? "border-green-200 bg-green-50/40" : "border-red-200 bg-red-50/50"
                }`}
              >
                <span
                  className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-full ${
                    ind.pass ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{ind.name}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                      ind.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ind.pass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {ind.pass ? "Cumple" : "No cumple"}
                  </span>
                </div>
                <p className={`mt-2 text-2xl font-bold ${ind.pass ? "text-green-700" : "text-red-700"}`}>
                  {typeof ind.value === "number" ? `${ind.value}%` : ind.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Norma INIAF: {ind.threshold}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Fuente: Compendio de Normas Nacionales sobre Semillas de Especies Agrícolas, INIAF 2022.
          </p>
        </Card>
      )}

      {/* Distribución por categoría */}
      {distribution.length > 0 && (
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Distribución por categoría de calidad (CNN)
          </h3>
          <div className="space-y-4">
            {distribution.map((item) => (
              <div key={item.class}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color ?? "#888" }}
                    />
                    {item.label_es ?? item.class}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.count} sem ·{" "}
                    <strong className="text-foreground">{item.percentage.toFixed(1)}%</strong>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color ?? "#888" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Separator />

      {/* ===== Detección + análisis morfológico por semilla ===== */}
      <SeedMorphologyPanels result={result} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Descargar Informe PDF
          </Button>
        </div>
        <Button
          onClick={onNewVerification}
          className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Nueva Verificación
        </Button>
      </div>
    </div>
  );
};

export default FinalReport;