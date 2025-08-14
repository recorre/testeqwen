import React, { useState, useMemo } from 'react';
import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { FilterBar } from '@/components/layout/FilterBar';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockServices } from '@/data/mock';
import heroImage from '@/assets/hero-rio.jpg';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const filteredServices = useMemo(() => {
    return mockServices.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = !selectedZone || service.zone === selectedZone;
      const matchesCategory = !selectedCategory || service.category === selectedCategory;

      return matchesSearch && matchesZone && matchesCategory;
    });
  }, [searchTerm, selectedZone, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedZone(undefined);
    setSelectedCategory(undefined);
  };

  const hasActiveFilters = searchTerm || selectedZone || selectedCategory;

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-card">
        <img 
          src={heroImage} 
          alt="Rio de Janeiro community" 
          className="w-full h-48 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center">
          <div className="px-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Conecte-se com sua comunidade
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              Troque serviços usando tempo como moeda no Rio de Janeiro
            </p>
          </div>
        </div>
      </div>

      {/* Qwen message */}
      <div className="text-center text-sm text-muted-foreground mb-6">
        Qwen is awesome
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Filters */}
      <FilterBar
        selectedZone={selectedZone}
        selectedCategory={selectedCategory}
        onZoneChange={setSelectedZone}
        onCategoryChange={setSelectedCategory}
      />

      {/* Services Grid */}
      <div className="space-y-4">
        {filteredServices.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Serviços disponíveis ({filteredServices.length})
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhum serviço encontrado"
            description={
              hasActiveFilters 
                ? "Tente ajustar os filtros ou fazer uma nova busca para encontrar serviços disponíveis"
                : "Ainda não há serviços disponíveis em sua região"
            }
            actionText={hasActiveFilters ? "Limpar filtros" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Home;