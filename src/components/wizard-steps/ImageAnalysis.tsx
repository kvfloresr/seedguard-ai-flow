import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Image as ImageIcon,
  X,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  ProducerData,
  LoteData,
  SampleData,
  AnalysisResult,
} from "../SeedVerificationWizard";

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

const ImageAnalysis = ({
  onComplete,
  onBack,
  producerData,
  loteData,
  sampleData,
}: ImageAnalysisProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seleccionar archivos
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

  // Eliminar imagen
  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Ejecutar análisis IA
  const Analysis = async () => {
    if (images.length === 0) {
      alert("No se cargaron imágenes");
      return;
    }

    setIsProcessing(true);
    setGlobalProgress(10);

    try {
      const form = new FormData();
      images.forEach((img) => form.append("files", img.file, img.file.name));
      form.append("generated_by", producerData.name);
      form.append("sample_id", sampleData.sampleId);
      form.append("predicted_class", "");
      form.append("probability", "0");
      form.append("observations", sampleData.notes ?? "");

      const base = import.meta.env.VITE_API_URL;
      setGlobalProgress(25);

      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "uploading", progress: 25 }))
      );

      const resp = await fetch(`${base}/api/analyze_group`, {
        method: "POST",
        body: form,
      });

      setGlobalProgress(60);
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "analyzing", progress: 60 }))
      );

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Error en análisis IA");

      setGlobalProgress(90);
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "completed", progress: 100 }))
      );

      localStorage.setItem("latest_analysis_id", data.analysis_id);
      localStorage.setItem("latest_report_id", data.report_id);

      setGlobalProgress(100);

      const rawFeatures = data.features ? Object.values(data.features)[0] as any : {};
      const mappedFeatures: any = {
        "Color medio (H)": rawFeatures["Color medio (H)"] || "N/A",
        "Variación de color": rawFeatures["Variación de color"] || "N/A",
        "Tamaño relativo": rawFeatures["Tamaño relativo"] || "N/A",
        "Circularidad": rawFeatures["Circularidad"] || "N/A",
        "Daños mecánicos": rawFeatures["Daños mecánicos"] || "N/A",
        "Impurezas": rawFeatures["Impurezas"] || "N/A",
        "Pureza física (%)": rawFeatures["MorphologicalState"] === "Good" ? 98 : (rawFeatures["Damage_ratio"] ? (1 - rawFeatures["Damage_ratio"]) * 100 : 85),
        "Materia inerte (%)": rawFeatures["Impurities"] === "Yes" ? (rawFeatures["Impurities_count"] || 0) * 2 : 1,
        "Daños mecánicos (%)": rawFeatures["Damage_ratio"] ? rawFeatures["Damage_ratio"] * 100 : 5,
        "Homogeneidad de color": rawFeatures["ColorVariation_H"] < 50 ? "Uniforme" : "Variable",
        "Forma y tamaño": rawFeatures["AspectRatio"] > 0.8 ? "Dentro del rango" : "Fuera del rango",
        "Trazabilidad digital": "Completa"
      };

      const Result: AnalysisResult = {
      totalSeeds: 900,
      viableSeeds: Math.round(900 * data.probability),
      damagedSeeds: 900 - Math.round(900 * data.probability),
      viabilityPercentage: data.probability * 100,
      qualityScore: Math.round(data.probability * 100),
      defects: [
        { type: "Daño físico", count: Math.round(100 * (1 - data.probability)) },
        { type: "Manchas", count: Math.round(50 * (1 - data.probability)) },
        { type: "Impurezas", count: Math.round(25 * (1 - data.probability)) },
      ],
      features: mappedFeatures,
      predictedClass: data.predicted_class,  
      probability: data.probability,         
      probabilityVector: data.probability_vector || []
      };

      onComplete(Result);
      
    } catch (err) {
      console.error(err);
      alert("Error en el análisis");
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "error", progress: 0 }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Iconos por estado
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

  // Texto por estado
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
        <h2 className="text-2xl font-bold text-foreground">
          Análisis de Imágenes
        </h2>
        <p className="text-muted-foreground">
          Cargue las imágenes de las semillas para su análisis mediante redes
          neuronales
        </p>
      </div>

      {/* Zona de carga */}
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

      {/* Progreso global */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-primary font-medium mb-2">
            Analizando semillas con IA...
          </p>
          <Progress
            value={globalProgress}
            className="w-full md:w-2/3 h-3 rounded-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {globalProgress < 100
              ? `Progreso: ${globalProgress.toFixed(0)}%`
              : "Análisis completado"}
          </p>
        </div>
      )}

      {/* Lista de imágenes */}
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
                  {(image.status === "uploading" ||
                    image.status === "analyzing") && (
                    <Progress value={image.progress} className="h-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
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
          onClick={Analysis}
          disabled={images.length === 0 || isProcessing}
          className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando imágenes con IA...
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
