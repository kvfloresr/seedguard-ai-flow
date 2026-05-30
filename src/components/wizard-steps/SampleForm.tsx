// src/components/wizard-steps/SampleForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SampleFormProps {
  lotId?: string;
  onSubmit: (data: {
    sampleId?: string;
    samplingDate: string;
    notes: string;
    lotId?: string;
  }) => void;
  onBack: () => void;
}

const SampleForm = ({ lotId, onSubmit, onBack }: SampleFormProps) => {
  const [formData, setFormData] = useState({
    samplingDate: "",
    notes: ""
  });

  const [errors, setErrors] = useState<{ samplingDate?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.samplingDate)
      newErrors.samplingDate = "Fecha de muestreo requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!lotId) {
      alert("El ID del lote no fue encontrado. Debe registrar primero un lote.");
      return;
    }

    setLoading(true);

    try {
      const base = import.meta.env.VITE_API_URL;

      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const body = {
        lot_id: lotId,
        sample_date: formData.samplingDate,
        analyst: user?.name ?? "Desconocido",
        observations: formData.notes
      };

      const res = await fetch(`${base}/api/samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const text = await res.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Error interno del servidor");
      }

      if (!res.ok) throw new Error(data.error || "Error creando muestra");

      onSubmit({
        sampleId: data.sample_id,
        samplingDate: formData.samplingDate,
        notes: formData.notes,
        lotId
      });
    } catch (err: any) {
      console.error("sample save error:", err);
      alert(err.message || "Error creando muestra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Registro de Muestra</h2>
        <p className="text-muted-foreground">Vinculada al lote seleccionado</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>ID de Lote</Label>
          <Input value={lotId ?? "No asignado"} readOnly />
        </div>

        <div>
          <Label>Fecha de Muestreo</Label>
          <Input
            type="date"
            value={formData.samplingDate}
            onChange={(e) =>
              setFormData({ ...formData, samplingDate: e.target.value })
            }
          />
          {errors.samplingDate && (
            <p className="text-sm text-destructive">{errors.samplingDate}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button type="submit" className="bg-gradient-primary" disabled={loading}>
          {loading ? "Guardando muestra..." : "Registrar Muestra y continuar"}
        </Button>
      </div>
    </form>
  );
};

export default SampleForm;
