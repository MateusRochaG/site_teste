// Este arquivo só é necessário quando você for conectar o site ao Supabase
// (fase 2 — depois que o site já estiver no ar funcionando com os dados fixos).
//
// As duas variáveis abaixo vêm de um arquivo .env (veja .env.example) e
// nunca devem ser digitadas direto aqui no código.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
