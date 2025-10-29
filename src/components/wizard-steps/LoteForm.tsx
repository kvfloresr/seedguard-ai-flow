import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Leaf, Weight, Calendar, ArrowLeft } from "lucide-react";
import { LoteData } from "../SeedVerificationWizard";

interface LoteFormProps {
  onSubmit: (data: LoteData) => void;
  onBack: () => void;
}

const seedTypes = [
  "Maíz",
  "Trigo",
  "Arroz",
  "Soja",
  "Girasol",
  "Cebada",
  "Avena",
  "Otro",
];

const LoteForm = ({ onSubmit, onBack }: LoteFormProps) => {
  const [formData, setFormData] = useState<LoteData>({
    loteNumber: "",
    seedType: "",
    quantity: 0,
    harvestDate: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoteData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof LoteData, string>> = {};
    if (!formData.loteNumber.trim()) newErrors.loteNumber = "El número de lote es requerido";
    if (!formData.seedType) newErrors.seedType = "Debe seleccionar un tipo de semilla";
    if (formData.quantity <= 0) newErrors.quantity = "La cantidad debe ser mayor a 0";
    if (!formData.harvestDate) newErrors.harvestDate = "La fecha de cosecha es requerida";
    
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
        <h2 className="text-2xl font-bold text-foreground">Registro del Lote</h2>
        <p className="text-muted-foreground">
          Ingrese la información del lote de semillas a verificar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="loteNumber" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Número de Lote
          </Label>
          <Input
            id="loteNumber"
            value={formData.loteNumber}
            onChange={(e) => setFormData({ ...formData, loteNumber: e.target.value })}
            placeholder="Ej: LOTE-2024-001"
            className={errors.loteNumber ? "border-destructive" : ""}
          />
          {errors.loteNumber && (
            <p className="text-sm text-destructive">{errors.loteNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seedType" className="flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Tipo de Semilla
          </Label>
          <Select
            value={formData.seedType}
            onValueChange={(value) => setFormData({ ...formData, seedType: value })}
          >
            <SelectTrigger className={errors.seedType ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccione el tipo" />
            </SelectTrigger>
            <SelectContent>
              {seedTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.seedType && (
            <p className="text-sm text-destructive">{errors.seedType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            Cantidad (kg)
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.1"
            value={formData.quantity || ""}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            placeholder="Ej: 500"
            className={errors.quantity ? "border-destructive" : ""}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvestDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha de Cosecha
          </Label>
          <Input
            id="harvestDate"
            type="date"
            value={formData.harvestDate}
            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            className={errors.harvestDate ? "border-destructive" : ""}
          />
          {errors.harvestDate && (
            <p className="text-sm text-destructive">{errors.harvestDate}</p>
          )}
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
          Continuar al Registro de Muestra
        </Button>
      </div>
    </form>
  );
};

export default LoteForm;
