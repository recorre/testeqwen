-- Add DELETE policy for profiles table to enable GDPR-compliant account deletion
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Add server-side CPF validation function
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cpf_clean text;
    sum1 integer := 0;
    sum2 integer := 0;
    digit1 integer;
    digit2 integer;
    i integer;
BEGIN
    -- Remove non-numeric characters
    cpf_clean := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Check if CPF has 11 digits
    IF length(cpf_clean) != 11 THEN
        RETURN false;
    END IF;
    
    -- Check for known invalid CPFs (all same digits)
    IF cpf_clean IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                     '44444444444', '55555555555', '66666666666', '77777777777', 
                     '88888888888', '99999999999') THEN
        RETURN false;
    END IF;
    
    -- Calculate first check digit
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf_clean from i for 1)::integer * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calculate second check digit
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf_clean from i for 1)::integer * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verify check digits
    RETURN digit1 = substring(cpf_clean from 10 for 1)::integer 
       AND digit2 = substring(cpf_clean from 11 for 1)::integer;
END;
$$;

-- Add data masking function for CPF
CREATE OR REPLACE FUNCTION public.mask_cpf(cpf_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cpf_clean text;
BEGIN
    IF cpf_input IS NULL OR cpf_input = '' THEN
        RETURN '';
    END IF;
    
    -- Remove non-numeric characters
    cpf_clean := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Check if CPF has 11 digits
    IF length(cpf_clean) != 11 THEN
        RETURN cpf_input; -- Return as-is if invalid format
    END IF;
    
    -- Return masked CPF showing only last 4 digits
    RETURN '***.***.***-' || substring(cpf_clean from 8 for 4);
END;
$$;