import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { AnalysisResult } from "../SeedVerificationWizard";

interface ResultsProps {
  result: AnalysisResult;
  onNext: () => void;
}

const Results = ({ result, onNext }: ResultsProps) => {
  // Una sola fuente de verdad: el análisis por semilla (INIAF).
  const certifiable = !!result.certifiable;
  const indicators = result.iniafIndicators ?? [];
  const distribution = result.classDistribution ?? [];
  const reasons = result.certificationReasons ?? [];
  const totalAnalyzed =
    result.totalAnalyzed ?? distribution.reduce((s, d) => s + d.count, 0);

  const hasData = indicators.length > 0 || distribution.length > 0;

  // Sin semillas detectadas: estado vacío claro en vez de datos vacíos.
  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card className="p-10 text-center bg-gradient-card">
          <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Sin datos de análisis</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            No se detectaron semillas en las imágenes. Vuelve al paso anterior e
            intenta con fotos más nítidas, bien iluminadas y con las semillas
            separadas.
          </p>
        </Card>
        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-gradient-primary hover:opacity-90">
            Ver Informe Final Detallado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== 1) Veredicto de certificación INIAF (lo primero) ===== */}
      <Card
        className="overflow-hidden border-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
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
              <h2
                className={`text-2xl md:text-3xl font-bold leading-tight ${
                  certifiable ? "text-green-700" : "text-red-700"
                }`}
              >
                {result.certificationLevel ??
                  (certifiable
                    ? "Apto para certificación INIAF"
                    : "No certificable — No cumple norma INIAF 2022")}
              </h2>
              {!certifiable && reasons.length > 0 && (
                <p className="text-sm text-red-700/80 mt-2">
                  No cumple en: {reasons.join("  ·  ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ===== 2) Indicadores de calidad física (Tabla 3.1) ===== */}
      {indicators.length > 0 && (
        <Card className="p-6 bg-gradient-card animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Indicadores de calidad física · Tabla 3.1 INIAF
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((ind, i) => (
              <div
                key={i}
                className={`relative rounded-xl border p-4 pl-5 ${
                  ind.pass
                    ? "border-green-200 bg-green-50/40"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                {/* acento lateral por estado */}
                <span
                  className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-full ${
                    ind.pass ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{ind.name}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                      ind.pass
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ind.pass ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {ind.pass ? "Cumple" : "No cumple"}
                  </span>
                </div>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    ind.pass ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {typeof ind.value === "number" ? `${ind.value}%` : ind.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Norma INIAF: {ind.threshold}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Fuente: Compendio de Normas Nacionales sobre Semillas de Especies
            Agrícolas, INIAF 2022.
          </p>
        </Card>
      )}

      {/* ===== 3) Análisis de defectos · distribución por categoría ===== */}
      {distribution.length > 0 && (
        <Card className="p-6 bg-gradient-card animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Análisis de defectos · Distribución por categoría (CNN)
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
                    <strong className="text-foreground">
                      {item.percentage.toFixed(1)}%
                    </strong>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color ?? "#888",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ===== Acción ===== */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Ver Informe Final Detallado
        </Button>
      </div>
    </div>
  );
};

export default Results;