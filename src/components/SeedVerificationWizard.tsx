import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2 } from "lucide-react";
import ProducerForm from "./wizard-steps/ProducerForm";
import LoteForm from "./wizard-steps/LoteForm";
import SampleForm from "./wizard-steps/SampleForm";
import ImageAnalysis from "./wizard-steps/ImageAnalysis";
import Results from "./wizard-steps/Results";
import FinalReport from "./wizard-steps/FinalReport";

export interface ProducerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LoteData {
  variety: string;
  loteNumber: string;
  seedType: string;
  quantity: number;
  harvestDate: string;
}

export interface SampleData {
  sampleId: string;
  samplingDate: string;
  samplingMethod: string;
  notes: string;
}

export interface AnalysisResult {
  features: Record<string, any>;
  totalSeeds: number;
  viableSeeds: number;
  damagedSeeds: number;
  viabilityPercentage: number;
  qualityScore: number;
  defects: {
    type: string;
    count: number;
  }[];
  predictedClass: string;   
  probability: number;     
  probabilityVector?: number[];
}

const steps = [
  { id: 1, name: "Productor", description: "Datos del productor" },
  { id: 2, name: "Lote", description: "Registro del lote" },
  { id: 3, name: "Muestra", description: "Datos de la muestra" },
  { id: 4, name: "Análisis", description: "Análisis de imágenes" },
  { id: 5, name: "Resultados", description: "Resultados del análisis" },
  { id: 6, name: "Informe", description: "Informe final" },
];

const SeedVerificationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [producerData, setProducerData] = useState<ProducerData | null>(null);
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [sampleData, setSampleData] = useState<SampleData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const progress = (currentStep / steps.length) * 100;

  const handleProducerSubmit = (data: ProducerData) => {
    setProducerData(data);
    setCurrentStep(2);
  };

  const handleLoteSubmit = (data: LoteData) => {
    setLoteData(data);
    setCurrentStep(3);
  };

  const handleSampleSubmit = (data: SampleData) => {
    setSampleData(data);
    setCurrentStep(4);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep(5);
  };

  const handleViewResults = () => {
    setCurrentStep(6);
  };

  const handleNewVerification = () => {
    setCurrentStep(1);
    setProducerData(null);
    setLoteData(null);
    setSampleData(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Sistema de Verificación de Calidad de Semillas
          </h1>
          <p className="text-muted-foreground text-lg">
            Análisis mediante procesamiento digital de imágenes y redes neuronales
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3 mb-4" />
          <div className="grid grid-cols-6 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                  step.id < currentStep
                    ? "opacity-100"
                    : step.id === currentStep
                    ? "opacity-100 scale-105"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step.id < currentStep
                      ? "bg-success text-success-foreground"
                      : step.id === currentStep
                      ? "bg-gradient-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : step.id === currentStep ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.name}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-lg">
          <div className="p-6 md:p-8">
            {currentStep === 1 && <ProducerForm onSubmit={handleProducerSubmit} />}
            {currentStep === 2 && (
              <LoteForm
                producerName={producerData?.name ?? ""}
                onSubmit={(data) => {
                  // data puede traer data.lotId
                  setLoteData({
                    variety: data.variety,
                    loteNumber: data.loteNumber,
                    seedType: data.seedType,
                    quantity: data.quantity,
                    harvestDate: data.harvestDate,
                    // opcional: guardar lotId dentro del estado de loteData u otro campo
                    ...(data as any).lotId ? { lotId: (data as any).lotId } : {}
                  } as any);
                  setCurrentStep(3);
                }}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <SampleForm
                lotId={(loteData as any)?.lotId}
                onSubmit={(sample) => {
                  setSampleData({
                    sampleId: sample.sampleId ?? "",
                    samplingDate: sample.samplingDate,
                    samplingMethod: sample.samplingMethod,
                    notes: sample.notes,
                  });
                  setCurrentStep(4);
                }}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <ImageAnalysis
                onComplete={handleAnalysisComplete}
                onBack={() => setCurrentStep(3)}
                producerData={producerData!}
                loteData={loteData!}
                sampleData={sampleData!}
              />
            )}
            {currentStep === 5 && analysisResult && (
              <Results result={analysisResult} onNext={handleViewResults} />
            )}
            {currentStep === 6 && analysisResult && producerData && loteData && sampleData && (
              <FinalReport
                result={analysisResult}
                producerData={producerData}
                loteData={loteData}
                sampleData={sampleData}
                onNewVerification={handleNewVerification}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SeedVerificationWizard;
