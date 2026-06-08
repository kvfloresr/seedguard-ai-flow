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
  Camera,
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
  setIsAnalyzing: (analyzing: boolean) => void;
  sessionId: string | null;
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
  setIsAnalyzing,
  sessionId,
}: ImageAnalysisProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const base = import.meta.env.VITE_API_URL;

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

  // ==== Captura desde la camara del sistema (stream del backend) ====
  const capturePhoto = async () => {
    try {
      const r = await fetch(`${base}/api/camera/snapshot?ts=${Date.now()}`);
      if (!r.ok) {
        alert("No se pudo capturar. La camara aun esta iniciando, intenta de nuevo.");
        return;
      }
      const blob = await r.blob();
      const file = new File([blob], `captura_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setImages((prev) => [
        ...prev,
        {
          file,
          preview: URL.createObjectURL(blob),
          status: "pending",
          progress: 0,
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error al capturar. Esta corriendo el backend?");
    }
  };

  const Analysis = async () => {
    if (images.length === 0) {
      alert("No se cargaron imagenes");
      setIsAnalyzing(true);
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
      if (!resp.ok) throw new Error(data.error || "Error en analisis IA");

      // ===== Conteo REAL de semillas con OpenCV (/api/count_seeds) =====
      let n_soy = 0,
        n_reject = 0,
        n_total = 0;
      const overlays: string[] = [];
      for (const img of images) {
        const cf = new FormData();
        cf.append("file", img.file, img.file.name);
        const cr = await fetch(`${base}/api/count_seeds`, {
          method: "POST",
          body: cf,
        });
        if (cr.ok) {
          const cd = await cr.json();
          n_soy += cd.n_soy ?? 0;
          n_reject += cd.n_reject ?? 0;
          n_total += cd.n_total ?? 0;
          if (cd.overlay_b64) overlays.push(cd.overlay_b64);
        }
      }

      // ===== Análisis por semilla individual + certificación INIAF 2022 =====
      let classDistribution: AnalysisResult["classDistribution"] = [];
      let iniafIndicators: AnalysisResult["iniafIndicators"] = [];
      let certifiable = false;
      let certificationLevel = "";
      let certificationReasons: string[] = [];
      let totalAnalyzed = 0;
      try {
        const psForm = new FormData();
        images.forEach(img => psForm.append("files", img.file, img.file.name));
        // Pasar conteos del módulo de visión clásica para el indicador "Materia inerte"
        psForm.append("n_reject", String(n_reject));
        psForm.append("n_total",  String(n_total));
        const psr = await fetch(`${base}/api/analyze_per_seed`, { method: "POST", body: psForm });
        if (psr.ok) {
          const psd = await psr.json();
          classDistribution    = psd.distribution          ?? [];
          iniafIndicators      = psd.iniaf_indicators       ?? [];
          certifiable          = psd.certifiable           ?? false;
          certificationLevel   = psd.certification_level   ?? "";
          certificationReasons = psd.certification_reasons ?? [];
          totalAnalyzed        = psd.total_seeds            ?? 0;
        }
      } catch (e) {
        console.error("Análisis por semilla INIAF:", e);
      }

      const saveReport = async () => {
        const reportData = {
          session_id: sessionId,
          sample_id: sampleData.sampleId,
          predicted_class: data.predicted_class,
          probability: data.probability,
          features: data.features,
          observations: sampleData.notes,
        };
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/save_report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(reportData),
        });
        if (!res.ok) throw new Error("Error guardando reporte");
      };
      await saveReport();

      setGlobalProgress(90);
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "completed", progress: 100 }))
      );

      localStorage.setItem("latest_analysis_id", data.analysis_id);
      localStorage.setItem("latest_report_id", data.report_id);

      setGlobalProgress(100);

      const rawFeatures = data.features
        ? (Object.values(data.features)[0] as any)
        : {};
      const mappedFeatures: any = {
        "Color medio (H)": rawFeatures["Color medio (H)"] || "N/A",
        "Variación de color": rawFeatures["Variacion de color"] || "N/A",
        "Tamaño relativo": rawFeatures["Tamano relativo"] || "N/A",
        "Circularidad": rawFeatures["Circularidad"] || "N/A",
        "Daños mecánicos": rawFeatures["Danos mecanicos"] || "N/A",
        "Impurezas": rawFeatures["Impurezas"] || "N/A",
        "Pureza física (%)":
          n_total > 0
            ? parseFloat(((n_soy / n_total) * 100).toFixed(1))
            : (rawFeatures["MorphologicalState"] === "Good" ? 98 : 85),
        "Materia inerte (%)":
          n_total > 0
            ? parseFloat(((n_reject / n_total) * 100).toFixed(1))
            : 1,
        "Daños mecánicos (%)": rawFeatures["Damage_ratio"]
          ? parseFloat((rawFeatures["Damage_ratio"] * 100).toFixed(1))
          : 0,
        "Homogeneidad de color":
          rawFeatures["ColorVariation_H"] < 50 ? "Uniforme" : "Variable",
        "Forma y tamaño":
          rawFeatures["AspectRatio"] > 0.8 ? "Dentro del rango" : "Fuera del rango",
        "Trazabilidad digital": "Completa",
      };

      const Result: AnalysisResult = {
        totalSeeds: n_total > 0 ? n_total : 1,
        viableSeeds: n_soy,
        damagedSeeds: n_reject,
        viabilityPercentage: n_total > 0 ? parseFloat(((n_soy / n_total) * 100).toFixed(1)) : data.probability * 100,
        qualityScore: n_total > 0 ? Math.round((n_soy / n_total) * 100) : Math.round(data.probability * 100),
        defects: [
          { type: "Semillas de soya detectadas", count: n_soy },
          { type: "No soya / impurezas", count: n_reject },
        ],
        features: mappedFeatures,
        predictedClass: data.predicted_class,
        probability: data.probability,
        probabilityVector: data.probability_vector || [],
        overlayImages: overlays,
        classDistribution,
        iniafIndicators,
        certifiable,
        certificationLevel,
        certificationReasons,
        totalAnalyzed,
      };

      onComplete(Result);
    } catch (err) {
      console.error(err);
      alert("Error en el analisis");
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "error", progress: 0 }))
      );
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
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
        return <Loader2 className="w-5 h-5 animate-spin text-info" />;
    }
  };

  const getStatusText = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return "Cargando imagen...";
      case "analyzing":
        return "Analizando con IA...";
      case "completed":
        return "Analisis completado";
      case "error":
        return "Error en el analisis";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Analisis de Imagenes</h2>
        <p className="text-muted-foreground">
          Cargue las imagenes de las semillas para su analisis mediante redes
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
          Arrastra imagenes aqui o haz clic para seleccionar
        </p>
        <p className="text-sm text-muted-foreground">
          Soporta JPG, JPEG, PNG, BPM. Maximo recomendado 10 imagenes
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

      {/* ==== Camara en vivo: abrir y capturar ==== */}
      <div className="border border-border rounded-lg p-4">
        {!cameraOpen ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCameraOpen(true)}
            disabled={isProcessing}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Capturar con camara
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Encuadra las semillas y presiona "Tomar foto". La imagen capturada se
              agrega a la lista para analizarse.
            </p>
            <div className="rounded-lg overflow-hidden border bg-black">
              <img
                src={`${base}/api/camera/stream?camera=0`}
                alt="Camara en vivo"
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={capturePhoto} className="gap-2">
                <Camera className="w-4 h-4" />
                Tomar foto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCameraOpen(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cerrar camara
              </Button>
            </div>
          </div>
        )}
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
              : "Analisis completado"}
          </p>
        </div>
      )}

      {/* Lista de imagenes */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Imagenes cargadas ({images.length})
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
              Analizando imagenes con IA...
            </>
          ) : (
            "Iniciar Analisis de IA"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageAnalysis;