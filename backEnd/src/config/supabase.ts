import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as senhas do arquivo .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

//  avisa se esqueci de criar o .env
if (!supabaseUrl || !supabaseKey) {
    throw new Error('As variáveis de ambiente do Supabase estão faltando!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);