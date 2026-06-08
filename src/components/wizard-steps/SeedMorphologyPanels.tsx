import { Card } from "@/components/ui/card";
import { AnalysisResult } from "../SeedVerificationWizard";

/**
 * SeedMorphologyPanels
 * --------------------
 * Reemplaza a las viejas tarjetas "Detección Individual" + "Análisis Morfológico
 * (Máscaras Aplicadas)" del FinalReport.
 *
 *  - 1 sola semilla  -> vista morfológica grande (recorte + contorno) y métricas.
 *  - Conjunto         -> imagen(es) de detección + grilla de paneles por semilla,
 *                        cada uno con su contorno (segmentado POR SEMILLA, no sobre
 *                        la imagen entera, así el borde sale limpio) y datos clave.
 *
 * Requiere que AnalysisResult tenga `perSeed` (mapeado desde la respuesta del
 * backend `per_seed`). Ver nota de integración al final del chat.
 */

interface SeedMetrics {
area_px: number;
diam_eq_px: number;
circularidad: number;
aspecto: number;
solidez: number;
}

interface SeedPanel {
class: string;
label_es?: string;
color?: string;
confidence: number;
panel?: string;          // data:image/jpeg;base64,...  (recorte | contorno)
metrics?: SeedMetrics | null;
}

interface Props {
result: AnalysisResult & { perSeed?: SeedPanel[] };
}

const Metric = ({ label, value }: { label: string; value: string | number }) => (
<div className="flex items-baseline justify-between gap-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
</div>
);

const SeedMorphologyPanels = ({ result }: Props) => {
const seeds: SeedPanel[] = result.perSeed ?? [];
const overlays: string[] = result.overlayImages ?? [];
const isSingle = seeds.length === 1;

if (seeds.length === 0) {
    return (
    <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-2">Análisis Morfológico</h3>
        <p className="text-sm text-muted-foreground">
        No hay datos morfológicos por semilla disponibles para esta muestra.
        </p>
    </Card>
    );
}

// ====== CASO 1: UNA SOLA SEMILLA (subida por foto) ======
if (isSingle) {
    const s = seeds[0];
    return (
    <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-1">Análisis Morfológico de la Semilla</h3>
        <p className="text-sm text-muted-foreground mb-5">
        Recorte original y máscara/contorno aplicados a la semilla.
        </p>

        <div className="grid gap-6 md:grid-cols-2 items-start">
        {s.panel && (
            <img
            src={s.panel}
            alt="Recorte y contorno de la semilla"
            className="w-full h-auto rounded-xl border bg-black/5"
            />
        )}

        <div className="space-y-4">
            <div className="flex items-center gap-3">
            <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color ?? "#888" }}
            />
            <span className="text-xl font-bold">{s.label_es ?? s.class}</span>
            <span className="ml-auto text-sm text-muted-foreground">
                Confianza {(s.confidence * 100).toFixed(1)}%
            </span>
            </div>

            {s.metrics && (
            <div className="rounded-xl border p-4 space-y-2 bg-background/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Descriptores morfológicos
                </p>
                <Metric label="Área" value={`${s.metrics.area_px} px`} />
                <Metric label="Diámetro equivalente" value={`${s.metrics.diam_eq_px} px`} />
                <Metric label="Circularidad" value={s.metrics.circularidad} />
                <Metric label="Relación de aspecto" value={s.metrics.aspecto} />
                <Metric label="Solidez" value={s.metrics.solidez} />
            </div>
            )}
        </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
        Verde: contorno detectado de la semilla. Métricas en píxeles (sin
        calibración física).
        </p>
    </Card>
    );
}

// ====== CASO 2: CONJUNTO DE SEMILLAS ======
return (
    <div className="space-y-6">
    {/* Detección individual sobre la imagen completa */}
    {overlays.length > 0 && (
        <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Detección Individual de Semillas</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overlays.map((img, i) => (
            <div key={i} className="text-center">
                <img src={img} alt={`Detección ${i + 1}`} className="w-full h-auto rounded-lg" />
                <p className="text-sm text-muted-foreground mt-2">
                Captura {i + 1} — detección por semilla
                </p>
            </div>
            ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
            Verde: semilla de soya detectada (numerada) · Rojo: objeto no soya / impureza
        </p>
        </Card>
    )}

    {/* Grilla de paneles por semilla con su máscara/contorno y datos */}
    <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-1">Análisis Morfológico por Semilla</h3>
        <p className="text-sm text-muted-foreground mb-5">
        La imagen se divide por semilla y a cada una se le aplica su propio
        contorno. {seeds.length} semillas analizadas.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {seeds.map((s, i) => (
            <div key={i} className="rounded-xl border overflow-hidden bg-background/50">
            {s.panel && (
                <img
                src={s.panel}
                alt={`Semilla ${i + 1}`}
                className="w-full h-auto bg-black/5"
                />
            )}
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                    #{i + 1}
                </span>
                <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color ?? "#888" }}
                />
                <span className="text-sm font-semibold truncate">
                    {s.label_es ?? s.class}
                </span>
                <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                    {(s.confidence * 100).toFixed(0)}%
                </span>
                </div>
                {s.metrics && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex justify-between">
                    <span>Ø equiv.</span>
                    <span className="tabular-nums">{s.metrics.diam_eq_px} px</span>
                    </div>
                    <div className="flex justify-between">
                    <span>Circular.</span>
                    <span className="tabular-nums">{s.metrics.circularidad}</span>
                    </div>
                    <div className="flex justify-between">
                    <span>Aspecto</span>
                    <span className="tabular-nums">{s.metrics.aspecto}</span>
                    </div>
                </div>
                )}
            </div>
            </div>
        ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
        Izquierda: recorte original · Derecha: contorno detectado (verde).
        Segmentación individual por semilla.
        </p>
    </Card>
    </div>
);
};

export default SeedMorphologyPanels;