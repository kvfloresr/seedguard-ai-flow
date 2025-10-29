import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Calendar, ClipboardList, FileText, ArrowLeft } from "lucide-react";
import { SampleData } from "../SeedVerificationWizard";

interface SampleFormProps {
  onSubmit: (data: SampleData) => void;
  onBack: () => void;
}

const samplingMethods = [
  "Muestreo Aleatorio Simple",
  "Muestreo Sistemático",
  "Muestreo Estratificado",
  "Muestreo por Conglomerados",
];

const SampleForm = ({ onSubmit, onBack }: SampleFormProps) => {
  const [formData, setFormData] = useState<SampleData>({
    sampleId: "",
    samplingDate: "",
    samplingMethod: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SampleData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof SampleData, string>> = {};
    if (!formData.sampleId.trim()) newErrors.sampleId = "El ID de muestra es requerido";
    if (!formData.samplingDate) newErrors.samplingDate = "La fecha de muestreo es requerida";
    if (!formData.samplingMethod) newErrors.samplingMethod = "Debe seleccionar un método de muestreo";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Registro de Muestra</h2>
        <p className="text-muted-foreground">
          Ingrese los detalles de la muestra extraída del lote
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sampleId" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            ID de Muestra
          </Label>
          <Input
            id="sampleId"
            value={formData.sampleId}
            onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
            placeholder="Ej: MUE-2024-001"
            className={errors.sampleId ? "border-destructive" : ""}
          />
          {errors.sampleId && (
            <p className="text-sm text-destructive">{errors.sampleId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="samplingDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha de Muestreo
          </Label>
          <Input
            id="samplingDate"
            type="date"
            value={formData.samplingDate}
            onChange={(e) => setFormData({ ...formData, samplingDate: e.target.value })}
            className={errors.samplingDate ? "border-destructive" : ""}
          />
          {errors.samplingDate && (
            <p className="text-sm text-destructive">{errors.samplingDate}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="samplingMethod" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Método de Muestreo
          </Label>
          <Select
            value={formData.samplingMethod}
            onValueChange={(value) => setFormData({ ...formData, samplingMethod: value })}
          >
            <SelectTrigger className={errors.samplingMethod ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccione el método" />
            </SelectTrigger>
            <SelectContent>
              {samplingMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.samplingMethod && (
            <p className="text-sm text-destructive">{errors.samplingMethod}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notas Adicionales
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Observaciones, condiciones especiales, etc."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          type="submit"
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Continuar al Análisis de Imágenes
        </Button>
      </div>
    </form>
  );
};

export default SampleForm;
