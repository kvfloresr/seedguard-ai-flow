import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Leaf, Calendar, ArrowLeft } from "lucide-react";
import { LoteData } from "../SeedVerificationWizard";

interface LoteFormProps {
  producerName: string;
  onSubmit: (data: LoteData & { lotId?: string }) => void;
  onBack: () => void;
  sessionId: string | null;
}

const soyVarieties = [
  "MUNASQA", "PATUJÚ", "SW4864", "NS6483" 
];

const categories = [
  "Básica", "Registrada", "Cetificada" 
];

const LoteForm = ({ producerName, onSubmit, onBack, sessionId}: LoteFormProps) => {
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
      try {
        const base = import.meta.env.VITE_API_URL;
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const body = {
          ...formData,
          created_by: user?.user_id || null,
          session_id: sessionId,  // Agrega
        };
        const res = await fetch(`${base}/api/save_lot`, {  // Usa nuevo endpoint
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (res.ok) {
          onSubmit({
            variety: formData.variety,
            loteNumber: data.lot_id ?? "",
            seedType: formData.species,
            quantity: 0,
            harvestDate: formData.reception,
            lotId: data.lot_id,
          });
        } else {
          alert(data.error || "Error guardando lote");
        }
      } catch (err) {
        alert("Error guardando lote");
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
