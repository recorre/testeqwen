-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name for UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id),
  time_rate INTEGER NOT NULL DEFAULT 1, -- Time units per hour
  location TEXT,
  availability TEXT, -- JSON string or simple text
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[], -- Array of tags for better searchability
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  requested_hours INTEGER NOT NULL DEFAULT 1,
  total_time_cost INTEGER NOT NULL, -- calculated: requested_hours * service.time_rate
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table for completed exchanges
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time_amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'service_exchange' CHECK (transaction_type IN ('service_exchange', 'gift', 'bonus', 'penalty')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Service categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" 
ON public.service_categories FOR SELECT 
USING (true);

-- Services policies
CREATE POLICY "Anyone can view active services" 
ON public.services FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own services" 
ON public.services FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update their own services" 
ON public.services FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Users can delete their own services" 
ON public.services FOR DELETE 
USING (auth.uid() = provider_id);

-- Service requests policies
CREATE POLICY "Users can view their own requests (as requester or provider)" 
ON public.service_requests FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create service requests" 
ON public.service_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Providers can update requests for their services" 
ON public.service_requests FOR UPDATE 
USING (auth.uid() = provider_id OR auth.uid() = requester_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "System can insert transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_service_requests_service_id ON public.service_requests(service_id);
CREATE INDEX idx_service_requests_requester_id ON public.service_requests(requester_id);
CREATE INDEX idx_service_requests_provider_id ON public.service_requests(provider_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_transactions_from_user_id ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user_id ON public.transactions(to_user_id);

-- Create updated_at triggers
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service categories
INSERT INTO public.service_categories (name, description, icon) VALUES
('Educação', 'Aulas particulares, tutoring, workshops', 'BookOpen'),
('Tecnologia', 'Suporte técnico, desenvolvimento, design', 'Laptop'),
('Casa e Jardim', 'Limpeza, jardinagem, manutenção', 'Home'),
('Culinária', 'Aulas de culinária, catering, delivery caseiro', 'ChefHat'),
('Saúde e Bem-estar', 'Massagem, yoga, personal trainer', 'Heart'),
('Transporte', 'Caronas, entrega, mudanças', 'Car'),
('Idiomas', 'Aulas de idiomas, tradução', 'Languages'),
('Arte e Cultura', 'Aulas de música, arte, fotografia', 'Palette'),
('Cuidado Pessoal', 'Cabeleireiro, manicure, estética', 'Scissors'),
('Consultoria', 'Consultoria profissional, mentoria', 'Users');

-- Create function to update time balances when transactions are created
CREATE OR REPLACE FUNCTION public.handle_transaction_balance_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct time from sender
  UPDATE public.profiles 
  SET time_balance = time_balance - NEW.time_amount 
  WHERE id = NEW.from_user_id;
  
  -- Add time to receiver
  UPDATE public.profiles 
  SET time_balance = time_balance + NEW.time_amount 
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic balance updates
CREATE TRIGGER trigger_transaction_balance_update
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_transaction_balance_update();

-- Create function to complete service request and create transaction
CREATE OR REPLACE FUNCTION public.complete_service_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  request_record public.service_requests%ROWTYPE;
BEGIN
  -- Get the service request
  SELECT * INTO request_record 
  FROM public.service_requests 
  WHERE id = request_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service request not found or not in accepted status';
  END IF;
  
  -- Update request status to completed
  UPDATE public.service_requests 
  SET status = 'completed', updated_at = now() 
  WHERE id = request_id;
  
  -- Create transaction
  INSERT INTO public.transactions (
    service_request_id,
    from_user_id,
    to_user_id,
    time_amount,
    description,
    transaction_type
  ) VALUES (
    request_id,
    request_record.requester_id,
    request_record.provider_id,
    request_record.total_time_cost,
    'Pagamento por serviço: ' || (SELECT title FROM public.services WHERE id = request_record.service_id),
    'service_exchange'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;