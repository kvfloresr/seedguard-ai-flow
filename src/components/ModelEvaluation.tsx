import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
Upload, ArrowLeft, Loader2, ScanLine, Layers, Cpu, ClipboardCheck,
BarChart3, ImageIcon, Camera, X, RotateCcw,
} from "lucide-react";
import {
BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import SeedMorphologyPanels from "./wizard-steps/SeedMorphologyPanels";

interface ModelEvaluationProps {
onBackToDashboard: () => void;
}
type SampleMode = "multi" | "single";
interface ImgItem { file: File; preview: string; }

const base = import.meta.env.VITE_API_URL;

const StepHeader = ({ n, title, desc, icon: Icon }: any) => (
<div className="flex items-start gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold flex-shrink-0">
    {n}
    </div>
    <div>
    <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="w-5 h-5 text-green-600" /> {title}
    </h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
</div>
);

const cardsFor = (cv: any) => (cv?.visuals ? [
{ k: "gray_image", t: "Escala de grises", d: cv.steps?.step1 },
{ k: "edges_image", t: "Deteccion de bordes", d: cv.steps?.step2 },
{ k: "thresh_image", t: "Umbralizacion", d: cv.steps?.step3 },
{ k: "segmented_image", t: "Segmentacion", d: cv.steps?.step4 },
{ k: "preprocessed_image", t: "Preprocesamiento final", d: cv.steps?.step5 },
].filter((c) => cv.visuals[c.k]) : []);

const ModelEvaluation = ({ onBackToDashboard }: ModelEvaluationProps) => {
const [images, setImages] = useState<ImgItem[]>([]);
const [sampleMode, setSampleMode] = useState<SampleMode>("multi");
const [cameraOpen, setCameraOpen] = useState(false);
const [running, setRunning] = useState(false);
const [progress, setProgress] = useState(0);

const [cvStepsList, setCvStepsList] = useState<any[]>([]);
const [detection, setDetection] = useState<any>(null);
const [perSeed, setPerSeed] = useState<any>(null);

const [metrics, setMetrics] = useState<any>(null);
const [loadingMetrics, setLoadingMetrics] = useState(false);

const resetResults = () => { setCvStepsList([]); setDetection(null); setPerSeed(null); };

const newEvaluation = () => {
    images.forEach((im) => URL.revokeObjectURL(im.preview));
    setImages([]);
    resetResults();
    setProgress(0);
};

const addFiles = (files: FileList | null) => {
    if (!files) return;
    const items = Array.from(files).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...items]);
    resetResults();
};

const removeImage = (i: number) => {
    setImages((prev) => {
    URL.revokeObjectURL(prev[i].preview);
    return prev.filter((_, idx) => idx !== i);
    });
    resetResults();
};

const capturePhoto = async () => {
    try {
    const r = await fetch(`${base}/api/camera/snapshot?ts=${Date.now()}`);
    if (!r.ok) {
        alert("No se pudo capturar. La camara aun esta iniciando, intenta de nuevo.");
        return;
    }
    const blob = await r.blob();
    const f = new File([blob], `captura_${Date.now()}.jpg`, { type: "image/jpeg" });
    setImages((prev) => [...prev, { file: f, preview: URL.createObjectURL(blob) }]);
    resetResults();
    } catch (err) {
    console.error(err);
    alert("Error al capturar. Esta corriendo el backend?");
    }
};

const runPipeline = async () => {
    if (images.length === 0) return;
    setRunning(true); setProgress(5);
    resetResults();

    try {
    const token = localStorage.getItem("token");

    // Paso 2: Procesamiento digital de CADA imagen
    const cvList: any[] = [];
    for (const im of images) {
        try {
        const fdSteps = new FormData();
        fdSteps.append("image", im.file);
        const r = await fetch(`${base}/api/process_image_steps`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: fdSteps,
        });
        if (r.ok) cvList.push(await r.json());
        else cvList.push(null);
        } catch { cvList.push(null); }
    }
    setCvStepsList(cvList);
    setProgress(40);

    // Paso 3: Deteccion + conteo (suma todas) SOLO en modo varias
    let n_soy = 0, n_reject = 0, n_total = 0;
    const overlays: string[] = [];
    if (sampleMode === "multi") {
        for (const im of images) {
        try {
            const cf = new FormData();
            cf.append("file", im.file, im.file.name);
            const cr = await fetch(`${base}/api/count_seeds`, { method: "POST", body: cf });
            if (cr.ok) {
            const cd = await cr.json();
            n_soy += cd.n_soy ?? 0;
            n_reject += cd.n_reject ?? 0;
            n_total += cd.n_total ?? 0;
            if (cd.overlay_b64) overlays.push(cd.overlay_b64);
            }
        } catch { /* */ }
        }
        setDetection({ overlays, n_soy, n_reject, n_total });
    } else {
        n_total = images.length;
    }
    setProgress(70);

    // Paso 4-5: Clasificacion por semilla + INIAF (todas las imagenes)
    const fdPs = new FormData();
    images.forEach((im) => fdPs.append("files", im.file, im.file.name));
    fdPs.append("n_reject", String(n_reject));
    fdPs.append("n_total", String(n_total));
    fdPs.append("mode", sampleMode);
    const rp = await fetch(`${base}/api/analyze_per_seed`, { method: "POST", body: fdPs });
    if (rp.ok) setPerSeed(await rp.json());
    setProgress(100);
    } catch (e) {
    console.error(e);
    alert("Ocurrio un error procesando las imagenes. Revisa que el backend este corriendo.");
    } finally {
    setRunning(false);
    }
};

const loadMetrics = async () => {
    setLoadingMetrics(true);
    try {
    const token = localStorage.getItem("token");
    const r = await fetch(`${base}/api/evaluate_model`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (r.ok) setMetrics(await r.json());
    else alert("No se pudieron cargar las metricas.");
    } catch {
    alert("Error cargando metricas del modelo.");
    } finally {
    setLoadingMetrics(false);
    }
};

const overallData = metrics?.metrics ? [
    { name: "Exactitud", value: +(metrics.metrics.accuracy * 100).toFixed(1) },
    { name: "Precision", value: +(metrics.metrics.precision * 100).toFixed(1) },
    { name: "Sensibilidad", value: +(metrics.metrics.recall * 100).toFixed(1) },
    { name: "F1", value: +(metrics.metrics.f1_score * 100).toFixed(1) },
] : [];
const classData = metrics?.class_metrics?.map((c: any) => ({
    class: c.class, "Precision": +(c.precision * 100).toFixed(1),
    "Sensibilidad": +(c.recall * 100).toFixed(1), "F1": +(c.f1_score * 100).toFixed(1),
})) ?? [];

const anyCv = cvStepsList.some((cv) => cardsFor(cv).length > 0);
const hasResults = anyCv || detection || perSeed;

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

    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-green-600" />
            </div>
            <div>
            <h1 className="text-3xl font-bold text-green-700">Evaluacion del Modelo CNN</h1>
            <p className="text-muted-foreground">
                Demostracion paso a paso del procesamiento de imagenes y la clasificacion de semillas.
            </p>
            </div>
        </div>
        {(images.length > 0 || hasResults) && (
            <Button variant="outline" onClick={newEvaluation} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Nueva evaluacion
            </Button>
        )}
        </div>

        <Card className="shadow-md">
        <CardContent className="p-6 space-y-4">
            <div>
            <p className="text-sm font-medium mb-2">Tipo de muestra</p>
            <div className="flex gap-2">
                <button type="button" onClick={() => { setSampleMode("multi"); resetResults(); }}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    sampleMode === "multi" ? "border-green-600 bg-green-50 text-green-700" : "border-border hover:bg-muted"}`}>
                Varias semillas
                </button>
                <button type="button" onClick={() => { setSampleMode("single"); resetResults(); }}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    sampleMode === "single" ? "border-green-600 bg-green-50 text-green-700" : "border-border hover:bg-muted"}`}>
                Una semilla (close-up)
                </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                {sampleMode === "multi"
                ? "Detecta y segmenta cada semilla de la muestra por separado."
                : "Cada foto es UNA sola semilla en primer plano; se analiza completa sin partirla."}
            </p>
            </div>

            <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById("eval-file")?.click()}
            >
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Haz clic para subir una o varias imagenes</p>
            <p className="text-sm text-muted-foreground">Puedes seleccionar varias a la vez (JPG, PNG)</p>
            <input id="eval-file" type="file" accept="image/*" multiple
                onChange={(e) => addFiles(e.target.files)} className="hidden" />
            </div>

            <div className="border border-border rounded-lg p-4">
            {!cameraOpen ? (
                <Button type="button" variant="outline" onClick={() => setCameraOpen(true)} className="gap-2">
                <Camera className="w-4 h-4" /> Capturar con camara
                </Button>
            ) : (
                <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Encuadra la(s) semilla(s) y presiona "Tomar foto". Cada captura se agrega a la lista.</p>
                <div className="rounded-lg overflow-hidden border bg-black">
                    <img src={`${base}/api/camera/stream?camera=1`} alt="Camara en vivo" className="w-full" />
                </div>
                <div className="flex gap-3">
                    <Button type="button" onClick={capturePhoto} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Camera className="w-4 h-4" /> Tomar foto
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCameraOpen(false)} className="gap-2">
                    <X className="w-4 h-4" /> Cerrar camara
                    </Button>
                </div>
                </div>
            )}
            </div>

            {images.length > 0 && (
            <div>
                <p className="text-sm font-medium mb-2">{images.length} imagen(es) lista(s)</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((im, i) => (
                    <div key={i} className="relative group">
                    <img src={im.preview} alt={`img ${i + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                    <button onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                    </button>
                    </div>
                ))}
                </div>
            </div>
            )}

            <div className="flex justify-center gap-3">
            <Button onClick={runPipeline} disabled={images.length === 0 || running}
                className="bg-green-600 hover:bg-green-700 text-white px-8">
                {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                : <><ScanLine className="w-4 h-4 mr-2" /> Analizar paso a paso</>}
            </Button>
            </div>
            {running && <Progress value={progress} className="h-2" />}
        </CardContent>
        </Card>

        {images.length > 0 && hasResults && (
        <Card className="shadow-md">
            <CardContent className="p-6">
            <StepHeader n={1} title="Imagenes originales" icon={ImageIcon}
                desc={`${images.length} muestra(s) que ingresan al sistema.`} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((im, i) => (
                <img key={i} src={im.preview} alt={`original ${i + 1}`} className="w-full h-40 object-cover rounded-lg border" />
                ))}
            </div>
            </CardContent>
        </Card>
        )}

        {/* PASO 2: Procesamiento digital de TODAS las imagenes */}
        {anyCv && (
        <Card className="shadow-md">
            <CardContent className="p-6">
            <StepHeader n={2} title="Procesamiento digital de las imagenes" icon={Layers}
                desc="Transformaciones de vision por computadora aplicadas a cada imagen antes de clasificar." />
            <div className="space-y-8">
                {cvStepsList.map((cv, imgIdx) => {
                const cards = cardsFor(cv);
                if (cards.length === 0) return null;
                return (
                    <div key={imgIdx}>
                    {cvStepsList.length > 1 && (
                        <p className="font-semibold text-sm mb-3 text-green-700">Imagen {imgIdx + 1}</p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {cards.map((c) => (
                        <div key={c.k} className="rounded-xl border overflow-hidden bg-background/50">
                            <img src={`data:image/png;base64,${cv.visuals[c.k]}`} alt={c.t} className="w-full h-auto" />
                            <div className="p-3">
                            <p className="font-semibold text-sm">{c.t}</p>
                            {c.d && <p className="text-xs text-muted-foreground mt-1">{c.d}</p>}
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                );
                })}
            </div>
            </CardContent>
        </Card>
        )}

        {detection && sampleMode === "multi" && (
        <Card className="shadow-md">
            <CardContent className="p-6">
            <StepHeader n={3} title="Deteccion de semillas" icon={ScanLine}
                desc="Vision clasica localiza y cuenta cada objeto, separando soya de impurezas." />
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{detection.n_soy ?? 0}</p>
                <p className="text-xs text-muted-foreground">Semillas de soya</p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold text-red-500">{detection.n_reject ?? 0}</p>
                <p className="text-xs text-muted-foreground">No soya / impurezas</p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold">{detection.n_total ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total detectado</p>
                </div>
            </div>
            {detection.overlays?.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {detection.overlays.map((ov: string, i: number) => (
                    <img key={i} src={ov} alt={`deteccion ${i + 1}`} className="w-full rounded-lg border" />
                ))}
                </div>
            )}
            </CardContent>
        </Card>
        )}

        {perSeed?.per_seed?.length > 0 && (
        <Card className="shadow-md">
            <CardContent className="p-6">
            <StepHeader n={sampleMode === "multi" ? 4 : 3} title="Clasificacion morfologica por semilla (CNN)" icon={Cpu}
                desc="Cada semilla se recorta, se segmenta y la red neuronal la clasifica segun su calidad." />
            <SeedMorphologyPanels result={{ perSeed: perSeed.per_seed, overlayImages: [] } as any} />
            </CardContent>
        </Card>
        )}

        {perSeed?.iniaf_indicators?.length > 0 && (
        <Card className="shadow-md border-2" style={{ borderColor: perSeed.certifiable ? "#22c55e" : "#ef4444" }}>
            <CardContent className="p-6">
            <StepHeader n={sampleMode === "multi" ? 5 : 4} title="Evaluacion segun normas INIAF 2022" icon={ClipboardCheck}
                desc="Los porcentajes se comparan con los umbrales oficiales para emitir el veredicto." />

            <div className={`flex items-center gap-4 p-4 rounded-lg mb-5 ${
                perSeed.certifiable ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                perSeed.certifiable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {perSeed.certifiable ? "\u2713" : "\u2717"}
                </div>
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Veredicto - {perSeed.total_seeds ?? 0} semillas
                </p>
                <p className={`text-xl font-bold ${perSeed.certifiable ? "text-green-700" : "text-red-700"}`}>
                    {perSeed.certification_level}
                </p>
                </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                    <th className="text-left p-3 font-semibold">Indicador</th>
                    <th className="text-center p-3 font-semibold">Valor</th>
                    <th className="text-center p-3 font-semibold">Norma INIAF</th>
                    <th className="text-center p-3 font-semibold">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {perSeed.iniaf_indicators.map((ind: any, i: number) => (
                    <tr key={i} className={`border-t ${ind.pass ? "" : "bg-red-50"}`}>
                        <td className="p-3 font-medium">{ind.name}</td>
                        <td className="p-3 text-center font-bold">
                        {typeof ind.value === "number" ? `${ind.value}%` : ind.value}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">{ind.threshold}</td>
                        <td className={`p-3 text-center text-lg font-bold ${ind.pass ? "text-green-600" : "text-red-600"}`}>
                        {ind.icon}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                Fuente: Compendio de Normas Nacionales sobre Semillas de Especies Agricolas, INIAF 2022.
            </p>
            </CardContent>
        </Card>
        )}

        <Card className="shadow-md">
        <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold">Metricas de rendimiento del modelo</h3>
            </div>
            <Button onClick={loadMetrics} disabled={loadingMetrics}
                variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                {loadingMetrics ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando...</>
                : <><BarChart3 className="w-4 h-4 mr-2" /> Cargar metricas</>}
            </Button>
            </div>

            {metrics?.metrics && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {overallData.map((m) => (
                    <div key={m.name} className="rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{m.value}%</p>
                    <p className="text-xs text-muted-foreground">{m.name}</p>
                    </div>
                ))}
                </div>

                {classData.length > 0 && (
                <div>
                    <p className="font-semibold mb-2 text-sm">Rendimiento por clase</p>
                    <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={classData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Precision" fill="#22c55e" />
                        <Bar dataKey="Sensibilidad" fill="#3b82f6" />
                        <Bar dataKey="F1" fill="#f59e0b" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                )}

                {metrics.confusion_matrix_base64 && (
                <div>
                    <p className="font-semibold mb-2 text-sm">Matriz de confusion</p>
                    <img src={metrics.confusion_matrix_base64} alt="Matriz de confusion"
                    className="max-w-xl w-full rounded-lg border mx-auto" />
                </div>
                )}
            </div>
            )}
            {!metrics && !loadingMetrics && (
            <p className="text-sm text-muted-foreground">
                Carga las metricas para ver exactitud, precision, sensibilidad, F1 y la matriz de confusion
                evaluadas sobre el conjunto de prueba.
            </p>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default ModelEvaluation;