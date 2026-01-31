import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://jzorrdpsvtvoglvxhjfi.supabase.co";
const supabaseKey = "sb_publishable_o-SOZ424gvj0l_qIHSW6Ig_RBlKnV-b";


export const supabase = createClient(supabaseUrl, supabaseKey);