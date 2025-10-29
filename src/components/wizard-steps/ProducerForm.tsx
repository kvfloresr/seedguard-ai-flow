import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { ProducerData } from "../SeedVerificationWizard";

interface ProducerFormProps {
  onSubmit: (data: ProducerData) => void;
}

const ProducerForm = ({ onSubmit }: ProducerFormProps) => {
  const [formData, setFormData] = useState<ProducerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<ProducerData>>({});

  const validate = () => {
    const newErrors: Partial<ProducerData> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.address.trim()) newErrors.address = "La dirección es requerida";
    
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
        <h2 className="text-2xl font-bold text-foreground">Datos del Productor</h2>
        <p className="text-muted-foreground">
          Ingrese la información del productor responsable del lote de semillas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Nombre Completo
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@correo.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Teléfono
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+51 999 999 999"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Dirección
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Dirección completa"
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Continuar al Registro del Lote
        </Button>
      </div>
    </form>
  );
};

export default ProducerForm;
