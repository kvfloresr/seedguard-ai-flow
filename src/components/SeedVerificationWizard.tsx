import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Home, Package, FlaskConical, Users, LogOut } from "lucide-react";
import ProducerForm from "./wizard-steps/ProducerForm";
import LoteForm from "./wizard-steps/LoteForm";
import SampleForm from "./wizard-steps/SampleForm";
import ImageAnalysis from "./wizard-steps/ImageAnalysis";
import Results from "./wizard-steps/Results";
import FinalReport from "./wizard-steps/FinalReport";
import Dashboard from "./Dashboard";
import { Heart, Activity } from "lucide-react";

export interface ProducerData {
  name: string;
  cod_producer: string;
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
  overlayImages?: string[];
  perSeed?: {
    class: string;
    label_es?: string;
    color?: string;
    confidence: number;
    panel?: string;
    metrics?: {
      area_px: number;
      diam_eq_px: number;
      circularidad: number;
      aspecto: number;
      solidez: number;
    } | null;
  }[];
  classDistribution?: {
    class: string;
    label_es: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  iniafIndicators?: {
    name: string;
    value: string | number;
    threshold: string;
    pass: boolean;
    icon: string;
  }[];
  certifiable?: boolean;
  certificationLevel?: string;
  certificationReasons?: string[];
  totalAnalyzed?: number;
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
  const [showDashboard, setShowDashboard] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const progress = (currentStep / steps.length) * 100;

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = user?.role_name === "Administrador";
  const isSupervisor = user?.role_name === "Supervisor"; 

  useEffect(() => {
    const startSession = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/start_wizard`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
      } else {
        console.error("Error iniciando sesión wizard");
      }
    };
    startSession();
  }, []);

  const handleRollback = async () => {
    if (!sessionId) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rollback_wizard`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (res.ok) {
      setCurrentStep(1);
      setProducerData(null);
      setLoteData(null);
      setSampleData(null);
      setAnalysisResult(null);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

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

  if (showDashboard) {
    return (
      <Dashboard
        name={user?.name || "Usuario"} 
        role_name={user?.role_name || "Usuario"} 
        reports={[]} 
        onBackToWizard={() => setShowDashboard(false)}
      />
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navbar */}
      <nav className="bg-green-600 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a className="text-xl font-bold">SeedDSS</a>
          <button className="md:hidden" aria-label="Toggle navigation">
            {/* Toggle para mobile, puedes agregar lógica */}
            <span>☰</span>
          </button>
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowDashboard(true)} className="text-white hover:bg-green-700">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                
                <span>{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

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

        <div className="mb-8">
        
        
        {/* Indicador de Red Neuronal Activada - Solo en paso 4 y cuando está analizando */}
        {currentStep === 4 && isAnalyzing && (
          <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-inner">
            <div className="flex items-center gap-4 mb-4">
              {/* Corazón palpitando */}
              <Heart className="w-12 h-12 text-red-500 animate-pulse" />
              {/* Líneas de latidos (ECG simple) */}
              <div className="flex items-center gap-1">
                <Activity className="w-6 h-6 text-blue-500" />
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-6 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-10 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-4 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-8 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          <p className="text-lg font-semibold text-blue-700 animate-pulse">
            Red Neuronal Activada - Analizando Imágenes...
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Procesando datos con algoritmos de IA avanzados
          </p>
          {/* Opcional: Spinner adicional */}
          <div className="mt-4 flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>

        {/* Step Content */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-lg">
          <div className="p-6 md:p-8">
            {currentStep === 1 && <ProducerForm onSubmit={handleProducerSubmit} sessionId={sessionId} />}
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
                sessionId={sessionId}
              />
            )}

            {currentStep === 3 && (
              <SampleForm
                lotId={(loteData as any)?.lotId}
                onSubmit={(sample) => {
                  setSampleData({
                    sampleId: sample.sampleId ?? "",
                    samplingDate: sample.samplingDate,
                    samplingMethod: (sample as any).samplingMethod ?? "",
                    notes: sample.notes,
                  });
                  setCurrentStep(4);
                }}
                onBack={() => setCurrentStep(2)}
                sessionId={sessionId}
              />
            )}

            {currentStep === 4 && (
              <ImageAnalysis
                onComplete={handleAnalysisComplete}
                onBack={() => { handleRollback(); setCurrentStep(3); }}  // Rollback al volver
                producerData={producerData!}
                loteData={loteData!}
                sampleData={sampleData!}
                setIsAnalyzing={setIsAnalyzing}
                sessionId={sessionId}  
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