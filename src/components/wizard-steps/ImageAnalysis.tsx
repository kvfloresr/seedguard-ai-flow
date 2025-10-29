import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Image as ImageIcon, X, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { ProducerData, LoteData, SampleData, AnalysisResult } from "../SeedVerificationWizard";

interface ImageAnalysisProps {
  onComplete: (result: AnalysisResult) => void;
  onBack: () => void;
  producerData: ProducerData;
  loteData: LoteData;
  sampleData: SampleData;
}

interface UploadedImage {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "analyzing" | "completed" | "error";
  progress: number;
}

const ImageAnalysis = ({ onComplete, onBack }: ImageAnalysisProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      progress: 0,
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const simulateAnalysis = async () => {
    setIsProcessing(true);

    // Simular carga de imágenes
    for (let i = 0; i < images.length; i++) {
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: "uploading" } : img
        )
      );

      // Simular progreso de carga
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, progress } : img
          )
        );
      }

      // Cambiar a estado de análisis
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: "analyzing", progress: 0 } : img
        )
      );

      // Simular análisis de IA
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, progress } : img
          )
        );
      }

      // Marcar como completado
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: "completed" } : img
        )
      );
    }

    // Generar resultados simulados
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockResult: AnalysisResult = {
      totalSeeds: Math.floor(Math.random() * 500) + 500,
      viableSeeds: 0,
      damagedSeeds: 0,
      viabilityPercentage: 0,
      qualityScore: 0,
      defects: [],
    };

    mockResult.viableSeeds = Math.floor(mockResult.totalSeeds * (0.85 + Math.random() * 0.1));
    mockResult.damagedSeeds = mockResult.totalSeeds - mockResult.viableSeeds;
    mockResult.viabilityPercentage = (mockResult.viableSeeds / mockResult.totalSeeds) * 100;
    mockResult.qualityScore = 75 + Math.random() * 20;

    mockResult.defects = [
      { type: "Daño mecánico", count: Math.floor(mockResult.damagedSeeds * 0.4) },
      { type: "Daño por insectos", count: Math.floor(mockResult.damagedSeeds * 0.3) },
      { type: "Decoloración", count: Math.floor(mockResult.damagedSeeds * 0.2) },
      { type: "Malformación", count: Math.floor(mockResult.damagedSeeds * 0.1) },
    ];

    onComplete(mockResult);
  };

  const getStatusIcon = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-5 h-5 animate-spin text-info" />;
      case "analyzing":
        return <Loader2 className="w-5 h-5 animate-spin text-secondary" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <ImageIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return "Cargando imagen...";
      case "analyzing":
        return "Analizando con IA...";
      case "completed":
        return "Análisis completado";
      case "error":
        return "Error en el análisis";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Análisis de Imágenes</h2>
        <p className="text-muted-foreground">
          Cargue las imágenes de las semillas para su análisis mediante redes neuronales
        </p>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          Arrastra imágenes aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-muted-foreground">
          Soporta JPG, PNG. Máximo 10 imágenes
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Imágenes cargadas ({images.length})
          </h3>
          <div className="grid gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border"
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{image.file.name}</p>
                    {!isProcessing && image.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(image.status)}
                    <span className="text-sm text-muted-foreground">
                      {getStatusText(image.status)}
                    </span>
                  </div>
                  {(image.status === "uploading" || image.status === "analyzing") && (
                    <Progress value={image.progress} className="h-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={simulateAnalysis}
          disabled={images.length === 0 || isProcessing}
          className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Iniciar Análisis de IA"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageAnalysis;
