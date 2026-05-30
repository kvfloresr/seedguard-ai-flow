// src/components/ModelEvaluation.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Para navegación
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, Brain, Layers, Zap, Sparkles, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ModelEvaluationProps {
    onBackToDashboard: () => void;
}

const ModelEvaluation = ({ onBackToDashboard }: ModelEvaluationProps) => {
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [predictionResult, setPredictionResult] = useState<any>(null);
const [simplePrediction, setSimplePrediction] = useState<any>(null);
const [metrics, setMetrics] = useState<any>(null);
const [loading, setLoading] = useState(false);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
    setSelectedFile(e.target.files[0]);
    }
};

const handlePredictSimple = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/predict_step_by_step`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
    });
    const data = await res.json();
    if (res.ok) {
        setSimplePrediction(data);
    } else {
        alert(`Error: ${data.error}`);
        setSimplePrediction(null);
    }
    } catch (err) {
    alert("Error en predicción simple");
    setSimplePrediction(null);
    } finally {
    setLoading(false);
    }
};

const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process_image_steps`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
    });
    const data = await res.json();
    if (res.ok) {
        setPredictionResult(data);
    } else {
        alert(`Error: ${data.error}`);
        setPredictionResult(null);
    }
    } catch (err) {
    alert("Error en predicción");
    setPredictionResult(null);
    } finally {
    setLoading(false);
    }
};

const handleLoadMetrics = async () => {
    setLoading(true);
    try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/evaluate_model`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    setMetrics(data);
    } catch (err) {
    alert("Error cargando métricas");
    } finally {
    setLoading(false);
    }
};

// Datos para gráficos
const classMetricsData = metrics?.class_metrics ? metrics.class_metrics.map((item: any) => ({
    class: item.class,
    precision: item.precision * 100,
    recall: item.recall * 100,
    f1_score: item.f1_score * 100
})) : [];

const overallMetricsData = metrics?.metrics ? [
    { name: "Accuracy", value: metrics.metrics.accuracy * 100 },
    { name: "Precision", value: metrics.metrics.precision * 100 },
    { name: "Recall", value: metrics.metrics.recall * 100 },
    { name: "F1-Score", value: metrics.metrics.f1_score * 100 }
] : [];

const probabilitiesData = predictionResult?.all_probabilities ? predictionResult.all_probabilities.map((prob: number, idx: number) => ({ name: `Clase ${idx}`, value: prob * 100 })) : [];

return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
    <div className="container mx-auto p-8 space-y-10">
        <div className="flex justify-start">
        <Button onClick={onBackToDashboard} className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-full shadow-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver Atrás
        </Button>
        </div>

        {/* Header Animado */}
        <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
            <div className="relative">
            <Brain className="w-20 h-20 text-white drop-shadow-lg animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-bounce" />
            </div>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">Evaluación del Modelo CNN</h1>
        <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Explora el funcionamiento interno de una Red Neuronal Convolucional para clasificación de semillas. 
            Sube una imagen y observa cómo se procesa paso a paso con visuales generados dinámicamente.
        </p>
        </div>

        {/* Sección de Procesamiento Digital de Imágenes (Pasos 1-5) */}
        <Card className="bg-white/90 backdrop-blur-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-slide-up">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
            <Upload className="w-8 h-8 animate-bounce" />
            Procesamiento Digital de Imágenes
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
            <div className="flex flex-col items-center space-y-4">
            <Label htmlFor="image" className="text-lg font-semibold text-gray-700">Sube tu Imagen de Semilla</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition-colors" />
            </div>
            <div className="text-center">
            <Button onClick={handlePredict} disabled={!selectedFile || loading} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                {loading ? <div className="flex items-center gap-2"><Zap className="w-5 h-5 animate-spin" /> Procesando...</div> : <div className="flex items-center gap-2"><Layers className="w-5 h-5" /> Procesar Imagen</div>}
            </Button>
            </div>
            {predictionResult && predictionResult.visuals && (
            <div className="space-y-8 animate-fade-in">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Layers className="w-5 h-5" /> Paso 1: Escala de Grises</h4>
                    <p className="text-sm text-gray-600 mb-4">{predictionResult.steps.step1}</p>
                    <img src={`data:image/png;base64,${predictionResult.visuals.gray_image}`} alt="Grises" className="w-full rounded-lg border-2 border-blue-300" />
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Paso 2: Detección de Bordes</h4>
                    <p className="text-sm text-gray-600 mb-4">{predictionResult.steps.step2}</p>
                    <img src={`data:image/png;base64,${predictionResult.visuals.edges_image}`} alt="Bordes" className="w-full rounded-lg border-2 border-purple-300" />
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Zap className="w-5 h-5" /> Paso 3: Umbralización (Manchas)</h4>
                    <p className="text-sm text-gray-600 mb-4">{predictionResult.steps.step3}</p>
                    <img src={`data:image/png;base64,${predictionResult.visuals.thresh_image}`} alt="Umbral" className="w-full rounded-lg border-2 border-green-300" />
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Paso 4: Segmentación</h4>
                    <p className="text-sm text-gray-600 mb-4">{predictionResult.steps.step4}</p>
                    <img src={`data:image/png;base64,${predictionResult.visuals.segmented_image}`} alt="Segmentación" className="w-full rounded-lg border-2 border-yellow-300" />
                </div>
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2"><Brain className="w-5 h-5" /> Paso 5: Preprocesamiento Final</h4>
                    <p className="text-sm text-gray-600 mb-4">{predictionResult.steps.step5}</p>
                    <img src={`data:image/png;base64,${predictionResult.visuals.preprocessed_image}`} alt="Preprocesado" className="w-full rounded-lg border-2 border-red-300" />
                </div>
                </div>
            </div>
            )}
        </CardContent>
        </Card>

        {/* Sección de Predicción de Clase de Semilla */}
        <Card className="bg-white/90 backdrop-blur-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-slide-up">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="w-8 h-8 animate-pulse" />
            Predicción de Clase de Semilla
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
            <div className="text-center">
            <Button onClick={handlePredictSimple} disabled={!selectedFile || loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                {loading ? <div className="flex items-center gap-2"><Zap className="w-5 h-5 animate-spin" /> Procesando...</div> : <div className="flex items-center gap-2"><Brain className="w-5 h-5" /> Predecir Clase</div>}
            </Button>
            </div>
            {simplePrediction && (
            <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-200 to-indigo-200 p-6 rounded-2xl shadow-lg">
                <p className="text-lg font-semibold text-blue-800"><strong>Clase Predicha:</strong> '{simplePrediction.label}' con {(simplePrediction.probability * 100).toFixed(2)}% de confianza.</p>
                </div>
                {simplePrediction.visuals && (
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2"><Zap className="w-5 h-5" /> Paso 6: Extracción de Features</h4>
                    <p className="text-sm text-gray-600 mb-4">{simplePrediction.steps.step6}</p>
                    <img src={`data:image/png;base64,${simplePrediction.visuals.features_histogram}`} alt="Features" className="w-full rounded-lg border-2 border-indigo-300" />
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-cyan-800 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Paso 7: Predicción de Probabilidades</h4>
                    <p className="text-sm text-gray-600 mb-4">{simplePrediction.steps.step7}</p>
                    <img src={`data:image/png;base64,${simplePrediction.visuals.probabilities_bar}`} alt="Probabilidades" className="w-full rounded-lg border-2 border-cyan-300" />
                </div>
                                <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <h4 className="font-bold text-pink-800 mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Paso 8: Selección de Clase</h4>
                    <p className="text-sm text-gray-600 mb-4">{simplePrediction.steps.step8}</p>
                    <img src={`data:image/png;base64,${simplePrediction.visuals.selected_class_bar}`} alt="Selección" className="w-full rounded-lg border-2 border-pink-300" />
                </div>
                </div>
                )}
            </div>
            )}
        </CardContent>
        </Card>

        {/* Sección de Métricas Avanzadas */}
        <Card className="bg-white/90 backdrop-blur-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-slide-up">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
            <BarChart3 className="w-8 h-8 animate-pulse" />
            Métricas Avanzadas de Rendimiento
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
            <div className="text-center">
            <Button onClick={handleLoadMetrics} disabled={loading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                {loading ? <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 animate-spin" /> Cargando...</div> : <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Cargar Métricas</div>}
            </Button>
            </div>
            {metrics && (
            <div className="space-y-8 animate-fade-in">
                {/* Estadísticas Generales */}
                <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-indigo-800 mb-4">Métricas Globales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-orange-800 mb-4">Tiempos de Ejecución</h3>
                    <ul className="space-y-3 text-sm">
                    <li><strong>Tiempo de Evaluación:</strong> {metrics.metrics.evaluation_time.toFixed(4)} s</li>
                    <li><strong>Tiempo de Predicción Total:</strong> {metrics.metrics.prediction_time_total.toFixed(4)} s</li>
                    <li><strong>Tiempo por Imagen:</strong> {(metrics.metrics.prediction_time_per_image * 1000).toFixed(4)} ms</li>
                    <li><strong>Número de Imágenes:</strong> {metrics.metrics.num_images}</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-4">Estos tiempos demuestran la eficiencia del modelo para análisis en tiempo real.</p>
                </div>
                </div>

                {/* Métricas por Clase */}
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-cyan-800 mb-4">Métricas por Clase</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={classMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="precision" fill="#06b6d4" name="Precision" />
                    <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
                    <Bar dataKey="f1_score" fill="#ef4444" name="F1-Score" />
                    </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-2">Estas métricas muestran el rendimiento equilibrado del modelo en cada clase.</p>
                </div>

                {/* Matriz de Confusión */}
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-red-800 mb-4">Matriz de Confusión</h3>
                <img src={metrics.confusion_matrix_base64} alt="Confusion Matrix" className="w-full rounded-lg border-2 border-red-300" />
                <p className="text-sm text-gray-600 mt-2">Visualiza predicciones correctas vs. errores.</p>
                </div>

                {/* Reporte Detallado */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">Reporte Detallado</h3>
                <pre className="bg-white p-4 rounded text-sm overflow-x-auto border">
                    {JSON.stringify(metrics.metrics.classification_report, null, 2)}
                </pre>
                </div>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default ModelEvaluation;