import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { User, Phone, MapPin, Search } from "lucide-react";
import { ProducerData } from "../SeedVerificationWizard";

interface ProducerFormProps {
  onSubmit: (data: ProducerData) => void;
  sessionId: string | null;
}

const ProducerForm = ({ onSubmit, sessionId }: ProducerFormProps) => {
  const [formData, setFormData] = useState<ProducerData>({
    name: "",
    phone: "",
    address: "",
    cod_producer: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [foundProducer, setFoundProducer] = useState<ProducerData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Partial<ProducerData>>({});

  const validate = () => {
    const newErrors: Partial<ProducerData> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.address.trim()) newErrors.address = "La dirección es requerida";
    if (!formData.cod_producer.trim()) newErrors.cod_producer = "El código de productor es requerido";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/get_producer?cod_or_name=${encodeURIComponent(searchTerm)}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const producer = await res.json();
        setFoundProducer(producer);
        setFormData(producer);  
      } else {
        setFoundProducer(null);
        alert("Productor no encontrado. Puedes registrarlo.");
      }
    } catch (err) {
      alert("Error buscando productor");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const base = import.meta.env.VITE_API_URL;
      const res = await fetch(`${base}/api/save_producer`, {  
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ...formData, session_id: sessionId }),
      });
      if (res.ok) onSubmit(formData);
      else alert("Error guardando productor");
    } catch (err) {
      alert("Error guardando productor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Datos del Productor</h2>
        <p className="text-muted-foreground">
          Busque por código o nombre, o registre uno nuevo
        </p>
      </div>

      {/* Campo de búsqueda */}
      <div className="space-y-2">
        <Label>Buscar Productor por Código o Nombre</Label>
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Código o nombre del productor"
          />
          <Button type="button" onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? "Buscando..." : "Buscar"}
          </Button>
        </div>
        {foundProducer && <p className="text-green-600">Productor encontrado y cargado.</p>}
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
          <Label htmlFor="cod_producer" className="flex items-center gap-2">
            Código de Productor
          </Label>
          <Input
            id="cod_producer"
            value={formData.cod_producer}
            onChange={(e) => setFormData({ ...formData, cod_producer: e.target.value })}
            placeholder="Ej: PROD001"
            className={errors.cod_producer ? "border-destructive" : ""}
          />
          {errors.cod_producer && (
            <p className="text-sm text-destructive">{errors.cod_producer}</p>
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