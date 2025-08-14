import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { FilterBar } from "@/components/layout/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  title: string;
  description: string;
  time_rate: number;
  location: string;
  availability: string;
  tags: string[];
  provider_id: string;
  category_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
  service_categories: {
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          profiles!services_provider_id_fkey(name, avatar_url),
          service_categories(name, icon)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar os serviços disponíveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (service) => service.category_id === selectedCategory
      );
    }

    setFilteredServices(filtered);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-rio animate-pulse">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Marketplace de Serviços
              </h1>
              <p className="text-muted-foreground mt-1">
                Encontre e ofereça serviços na sua comunidade
              </p>
            </div>
            <Button
              onClick={() => navigate("/services/new")}
              className="btn-rio"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ofertar Serviço
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serviços, habilidades ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onZoneChange={() => {}}
          onCategoryChange={handleCategoryFilter}
        />
      </div>

      {/* Services Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredServices.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhum serviço encontrado"
            description="Tente ajustar seus filtros ou seja o primeiro a ofertar um serviço!"
            actionText="Ofertar Primeiro Serviço"
            onAction={() => navigate("/services/new")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={{
                  id: service.id,
                  title: service.title,
                  description: service.description,
                  provider: {
                    name: service.profiles?.name || "Usuário",
                    avatar: service.profiles?.avatar_url || "",
                    rating: 4.5
                  },
                  timeRequired: `${service.time_rate}h`,
                  distance: "N/A",
                  category: service.service_categories?.name || "Geral",
                  zone: service.location || "N/A",
                  isUrgent: false
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}