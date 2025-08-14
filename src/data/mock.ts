export interface Service {
  id: string;
  title: string;
  description: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
  };
  timeRequired: string;
  distance: string;
  category: string;
  zone: string;
  isUrgent: boolean;
}

export interface Transaction {
  id: string;
  serviceName: string;
  providerName: string;
  timeSpent: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  type: 'earned' | 'spent';
}

export const mockServices: Service[] = [
  {
    id: "1",
    title: "Limpeza de apartamento",
    description: "Limpeza completa de apartamento 2 quartos em Copacabana",
    provider: { name: "Maria Silva", avatar: "/avatars/maria.jpg", rating: 4.8 },
    timeRequired: "3 horas",
    distance: "1.2km",
    category: "Limpeza",
    zone: "Zona Sul",
    isUrgent: true
  },
  {
    id: "2", 
    title: "Aulas de culinária italiana",
    description: "Ensino receitas tradicionais da nonna no meu apartamento",
    provider: { name: "Giuseppe Romano", avatar: "/avatars/giuseppe.jpg", rating: 4.9 },
    timeRequired: "2 horas",
    distance: "800m",
    category: "Culinária",
    zone: "Centro",
    isUrgent: false
  },
  {
    id: "3",
    title: "Conserto de computador",
    description: "Formatação e limpeza de vírus em notebook ou desktop",
    provider: { name: "Carlos Tech", avatar: "/avatars/carlos.jpg", rating: 4.6 },
    timeRequired: "1.5 horas",
    distance: "2.1km",
    category: "Tecnologia",
    zone: "Tijuca",
    isUrgent: false
  },
  {
    id: "4",
    title: "Cuidar de plantas",
    description: "Rego e cuidado de plantas durante viagem (1 semana)",
    provider: { name: "Ana Verde", avatar: "/avatars/ana.jpg", rating: 5.0 },
    timeRequired: "30 min/dia",
    distance: "500m",
    category: "Jardim",
    zone: "Zona Sul",
    isUrgent: true
  },
  {
    id: "5",
    title: "Aula de violão",
    description: "Ensino violão popular brasileiro para iniciantes",
    provider: { name: "Pedro Samba", avatar: "/avatars/pedro.jpg", rating: 4.7 },
    timeRequired: "1 hora",
    distance: "1.8km",
    category: "Música",
    zone: "Centro",
    isUrgent: false
  },
  {
    id: "6",
    title: "Pintura de parede",
    description: "Pintura de sala e quarto, materiais por conta do cliente",
    provider: { name: "Roberto Pintor", avatar: "/avatars/roberto.jpg", rating: 4.4 },
    timeRequired: "4 horas",
    distance: "3.2km",
    category: "Reforma",
    zone: "Barra",
    isUrgent: false
  },
  {
    id: "7",
    title: "Transporte para consulta médica",
    description: "Levo idosos para consultas e exames médicos",
    provider: { name: "Lucia Cuidado", avatar: "/avatars/lucia.jpg", rating: 4.9 },
    timeRequired: "2 horas",
    distance: "1.5km",
    category: "Transporte",
    zone: "Zona Norte",
    isUrgent: true
  },
  {
    id: "8",
    title: "Organização de armários",
    description: "Organizo e otimizo espaços de closets e armários",
    provider: { name: "Fernanda Organiza", avatar: "/avatars/fernanda.jpg", rating: 4.5 },
    timeRequired: "3 horas",
    distance: "2.5km",
    category: "Organização",
    zone: "Tijuca",
    isUrgent: false
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    serviceName: "Limpeza de casa",
    providerName: "Maria Silva",
    timeSpent: 3,
    status: "completed",
    date: "2024-01-15",
    type: "spent"
  },
  {
    id: "2",
    serviceName: "Aula de português",
    providerName: "João Santos",
    timeSpent: 2,
    status: "completed",
    date: "2024-01-12",
    type: "earned"
  },
  {
    id: "3",
    serviceName: "Cuidar de cachorro",
    providerName: "Ana Verde",
    timeSpent: 1,
    status: "pending",
    date: "2024-01-18",
    type: "spent"
  },
  {
    id: "4",
    serviceName: "Conserto de bicicleta",
    providerName: "Pedro Mecânico",
    timeSpent: 1.5,
    status: "completed",
    date: "2024-01-10",
    type: "spent"
  }
];

export const zones = [
  "Zona Sul", "Centro", "Zona Norte", "Barra", "Tijuca"
];

export const categories = [
  "Limpeza", "Culinária", "Tecnologia", "Jardim", "Música", "Reforma", "Transporte", "Organização"
];