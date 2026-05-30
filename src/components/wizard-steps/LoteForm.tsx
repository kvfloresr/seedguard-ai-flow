// src/components/wizard-steps/LoteForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Leaf, Calendar, ArrowLeft } from "lucide-react";
import { LoteData } from "../SeedVerificationWizard";

interface LoteFormProps {
  producerName: string; // viene del paso Productor
  onSubmit: (data: LoteData & { lotId?: string }) => void;
  onBack: () => void;
}

const soyVarieties = [
  "INTACTA", "MG/PR", "RR", "OTRA" // ajusta según tus variedades reales
];

const categories = [
  "A", "B", "C" // ejemplo; sustituye por las categorías reales o mantenible desde admin
];

const LoteForm = ({ producerName, onSubmit, onBack }: LoteFormProps) => {
  const [formData, setFormData] = useState({
    producer: producerName || "",
    species: "Soja",
    variety: soyVarieties[0],
    category: categories[0],
    reception: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.producer.trim()) newErrors.producer = "El productor es requerido";
    if (!formData.variety) newErrors.variety = "Seleccione la variedad";
    if (!formData.category) newErrors.category = "Seleccione categoría";
    if (!formData.reception) newErrors.reception = "Fecha de recepción requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL;
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const body = {
        producer: formData.producer,
        species: formData.species,
        variety: formData.variety,
        category: formData.category,
        reception: formData.reception,
        created_by: user?.user_id || null
      };

      const headers: Record<string,string> = { "Content-Type": "application/json" };
      // si manejas JWT: headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${base}/api/lots`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Error al guardar lote");

      const lotId = data.lot_id ?? data.lotId ?? null;

      // Llamamos al paso siguiente con la info del lote y el lotId si está disponible
      onSubmit({
        variety: formData.variety,
        loteNumber: lotId ?? "", // mantener compatibilidad: si no hay lot_id, dejar vacio
        seedType: formData.species,
        quantity: 0, // no lo usamos en SQL, mantener para UI
        harvestDate: formData.reception,
        ...(lotId ? { lotId } : {})
      } as LoteData & { lotId?: string });
    } catch (err: any) {
      console.error("Lote save error:", err);
      alert(err.message || "Error guardando lote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Registro del Lote</h2>
        <p className="text-muted-foreground">Información del lote (especie: Soja)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label className="font-medium text-sm">Productor</Label>
          <Input value={formData.producer} readOnly />
        </div>

        <div>
          <Label className="font-medium text-sm">Variedad</Label>
          <Select value={formData.variety} onValueChange={(v) => setFormData({ ...formData, variety: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {soyVarieties.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.variety && <p className="text-sm text-destructive">{errors.variety}</p>}
        </div>

        <div>
          <Label className="font-medium text-sm">Categoría</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        <div>
          <Label className="font-medium text-sm">Fecha de Recepción</Label>
          <Input type="date" value={formData.reception} onChange={(e) => setFormData({ ...formData, reception: e.target.value })} />
          {errors.reception && <p className="text-sm text-destructive">{errors.reception}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>Volver</Button>
        <Button type="submit" className="bg-gradient-primary" disabled={loading}>
          {loading ? "Guardando..." : "Registrar lote y continuar"}
        </Button>
      </div>
    </form>
  );
};

export default LoteForm;
