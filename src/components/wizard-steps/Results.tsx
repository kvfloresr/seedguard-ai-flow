import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, PieChart } from "lucide-react";
import { AnalysisResult } from "../SeedVerificationWizard";


interface ResultsProps {
  result: AnalysisResult;
  onNext: () => void;
}

const Results = ({ result, onNext }: ResultsProps) => {
  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-info";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 75) return "Buena";
    if (score >= 60) return "Aceptable";
    return "Deficiente";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Análisis Completado</h2>
        <p className="text-muted-foreground">
          El sistema de IA ha procesado todas las imágenes exitosamente
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        

        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calificación</p>
              <p className={`text-2xl font-bold ${getQualityColor(result.qualityScore)}`}>
                {result.qualityScore.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Viability Percentage */}
      <Card className="p-6 bg-gradient-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Porcentaje de Viabilidad</h3>
            <span className="text-2xl font-bold text-primary">
              {result.viabilityPercentage.toFixed(2)}%
            </span>
          </div>
          <Progress value={result.viabilityPercentage} className="h-4" />
          <p className="text-sm text-muted-foreground">
            Indica el porcentaje de semillas que cumplen con los estándares de calidad
          </p>
        </div>
      </Card>

      {/* Quality Score */}
      <Card className="p-6 bg-gradient-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Puntuación de Calidad</h3>
            <span className={`text-2xl font-bold ${getQualityColor(result.qualityScore)}`}>
              {getQualityLabel(result.qualityScore)}
            </span>
          </div>
          <Progress value={result.qualityScore} className="h-4" />
          <p className="text-sm text-muted-foreground">
            Evaluación general basada en múltiples parámetros de calidad
          </p>
        </div>
      </Card>

      {/* Defects Breakdown */}
      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Análisis de Defectos</h3>
        <div className="space-y-3">
          {result.defects.map((defect, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{defect.type}</span>
                <span className="text-muted-foreground">
                  {defect.count} ({((defect.count / result.totalSeeds) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={(defect.count / result.totalSeeds) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Indicadores Morfológicos INIAF */}
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Pureza Física</h3>
    <p className="text-2xl font-bold text-success">
      {result.features["Pureza física (%)"]?.toFixed(2)}%
    </p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: ≥ 98%
    </p>
  </Card>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Materia Inerte</h3>
    <p className="text-2xl font-bold text-warning">
      {result.features["Materia inerte (%)"]?.toFixed(2)}%
    </p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: ≤ 2%
    </p>
  </Card>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Daños Mecánicos</h3>
    <p className="text-2xl font-bold text-destructive">
      {result.features["Daños mecánicos (%)"]?.toFixed(2)}%
    </p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: ≤ 1%
    </p>
  </Card>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Homogeneidad de Color</h3>
    <p className="text-2xl font-bold">{result.features["Homogeneidad de color"]}</p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: Uniforme
    </p>
  </Card>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Forma y Tamaño</h3>
    <p className="text-sm text-muted-foreground">
      {result.features["Forma y tamaño"]}
    </p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: Dentro del rango varietal
    </p>
  </Card>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold">Trazabilidad Digital</h3>
    <p className="text-2xl font-bold text-primary">
      {result.features["Trazabilidad digital"]}
    </p>
    <p className="text-sm text-muted-foreground">
      Norma INIAF: Completa
    </p>
  </Card>
</div>

<div className="text-center mb-6">
    <h1 className="text-4xl font-bold text-primary mb-2">
      Clase Predicha: {result.predictedClass}
    </h1>
    <p className="text-lg text-muted-foreground">
      Confianza del Modelo: {result.probability.toFixed(2)}%
    </p>
    <Progress value={result.probability * 100} className="w-1/2 mx-auto mt-2" />
    {result.probabilityVector && result.probabilityVector.length > 0 && (
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Vector de Probabilidades:</p>
        <div className="flex justify-center gap-2 mt-2">
          {result.probabilityVector.map((prob, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs">Clase {idx}</p>
              <Progress value={prob * 100} className="w-8 h-2" />
              <p className="text-xs">{(prob * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  <Card className="p-6 bg-gradient-card">
    <h3 className="text-lg font-semibold mb-4">Características Morfológicas Extraídas</h3>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(result.features).map(([key, value]) => (
        <Card key={key} className="p-4 bg-background/50">
          <h4 className="font-medium text-sm text-muted-foreground">{key}</h4>
          <p className="text-lg font-bold">{String(value)}</p>
        </Card>
      ))}
    </div>
  </Card>


      {/* Action Button */}
      <div className="flex justify-end pt-4">
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
