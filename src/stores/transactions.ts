import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  service: { title: string; category: string };
  provider: { name: string; avatarUrl: string };
  hours: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  type: 'earned' | 'spent';
}

interface TransactionState {
  transactions: Transaction[];
  completeTransaction: (id: string) => void;
  cancelTransaction: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  getTimeBalance: () => number;
}

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    service: { title: "Aula de violão", category: "Música" },
    provider: { name: "Carlos Lima", avatarUrl: "/avatars/carlos.jpg" },
    hours: 1.5,
    date: new Date(2023, 7, 10),
    status: "completed",
    type: "spent"
  },
  {
    id: "t2",
    service: { title: "Reparo de computador", category: "Tecnologia" },
    provider: { name: "Ana Costa", avatarUrl: "/avatars/ana.jpg" },
    hours: 2,
    date: new Date(2023, 7, 12),
    status: "pending",
    type: "earned"
  },
  {
    id: "t3",
    service: { title: "Limpeza de casa", category: "Limpeza" },
    provider: { name: "Maria Silva", avatarUrl: "/avatars/maria.jpg" },
    hours: 3,
    date: new Date(2023, 7, 8),
    status: "completed",
    type: "spent"
  },
  {
    id: "t4",
    service: { title: "Aula de português", category: "Educação" },
    provider: { name: "João Santos", avatarUrl: "/avatars/joao.jpg" },
    hours: 2,
    date: new Date(2023, 7, 14),
    status: "pending",
    type: "earned"
  }
];

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: mockTransactions,

      completeTransaction: (id: string) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status: 'completed' as const }
              : transaction
          )
        }));
      },

      cancelTransaction: (id: string) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status: 'cancelled' as const }
              : transaction
          )
        }));
      },

      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        }));
      },

      getTimeBalance: () => {
        const { transactions } = get();
        return transactions
          .filter(t => t.status === 'completed')
          .reduce((balance, transaction) => {
            return transaction.type === 'earned' 
              ? balance + transaction.hours 
              : balance - transaction.hours;
          }, 15); // Starting balance of 15 hours
      }
    }),
    {
      name: 'banco-tempo-transactions',
    }
  )
);