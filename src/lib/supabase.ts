import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://jqvdzjoveeiritveajdw.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjQwNzY4M2YyLWZiMWYtNDU2MS1iY2UyLTlmYWU3NGJmZDRhZiJ9.eyJwcm9qZWN0SWQiOiJqcXZkempvdmVlaXJpdHZlYWpkdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwNzg0OTUyLCJleHAiOjIwODYxNDQ5NTIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.EuHpA8PJnz0n228w5GiaNhK9MRHa58Vd2ZC_mIBZM60';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };