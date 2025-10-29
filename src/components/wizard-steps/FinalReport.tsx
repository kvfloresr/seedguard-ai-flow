import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, RefreshCw, Calendar, User, Package, FlaskConical } from "lucide-react";
import { AnalysisResult, ProducerData, LoteData, SampleData } from "../SeedVerificationWizard";

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

  const handleDownloadPDF = () => {
    // Aquí iría la lógica para generar y descargar el PDF
    alert("Funcionalidad de descarga PDF en desarrollo");
  };

  const handleDownloadExcel = () => {
    // Aquí iría la lógica para generar y descargar el Excel
    alert("Funcionalidad de descarga Excel en desarrollo");
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
        <p className="text-sm text-muted-foreground">
          Generado el {currentDate}
        </p>
      </div>

      <Separator />

      {/* Producer Information */}
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
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{producerData.email}</p>
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

      {/* Lote Information */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información del Lote</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Número de Lote</p>
            <p className="font-medium">{loteData.loteNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Semilla</p>
            <p className="font-medium">{loteData.seedType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cantidad</p>
            <p className="font-medium">{loteData.quantity} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Cosecha</p>
            <p className="font-medium">
              {new Date(loteData.harvestDate).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
      </Card>

      {/* Sample Information */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Información de la Muestra</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">ID de Muestra</p>
            <p className="font-medium">{sampleData.sampleId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Muestreo</p>
            <p className="font-medium">
              {new Date(sampleData.samplingDate).toLocaleDateString("es-ES")}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Método de Muestreo</p>
            <p className="font-medium">{sampleData.samplingMethod}</p>
          </div>
          {sampleData.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="font-medium">{sampleData.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results Summary */}
      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Resumen de Resultados</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Semillas</p>
            <p className="text-3xl font-bold text-primary">{result.totalSeeds}</p>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Viables</p>
            <p className="text-3xl font-bold text-success">{result.viableSeeds}</p>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Dañadas</p>
            <p className="text-3xl font-bold text-destructive">{result.damagedSeeds}</p>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Viabilidad</p>
            <p className="text-3xl font-bold text-info">
              {result.viabilityPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Defects Detail */}
      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Detalle de Defectos Detectados</h3>
        <div className="space-y-2">
          {result.defects.map((defect, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
            >
              <span className="font-medium">{defect.type}</span>
              <span className="text-muted-foreground">
                {defect.count} semillas ({((defect.count / result.totalSeeds) * 100).toFixed(2)}%)
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quality Assessment */}
      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Evaluación de Calidad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Puntuación de Calidad</span>
            <span className="text-2xl font-bold text-primary">
              {result.qualityScore.toFixed(2)}/100
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.qualityScore >= 90 && "Excelente: El lote cumple con los más altos estándares de calidad."}
            {result.qualityScore >= 75 && result.qualityScore < 90 && "Buena: El lote presenta una calidad aceptable para comercialización."}
            {result.qualityScore >= 60 && result.qualityScore < 75 && "Aceptable: El lote puede ser comercializado con ciertas restricciones."}
            {result.qualityScore < 60 && "Deficiente: Se recomienda no comercializar este lote sin tratamiento previo."}
          </p>
        </div>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadExcel}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Excel
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
