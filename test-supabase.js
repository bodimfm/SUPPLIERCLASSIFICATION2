// Teste simples para verificar a conexão com o Supabase
const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas variáveis que estão no .env.local
const supabaseUrl = 'https://wzuodxgbqafqxmhlqhiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dW9keGdicWFmcXhtaGxxaGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDE0ODMsImV4cCI6MjA1OTIxNzQ4M30.TOvEHVuQnprGn2KQ6X81sDQ9fxJ3xpVJU2gVVcXkz-Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    // Verificar se conseguimos obter a lista de buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erro ao listar buckets:', error.message);
      return;
    }
    
    console.log('Conexão bem-sucedida! Buckets encontrados:', buckets.length);
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });

    // Verificar se o bucket 'supplier-documents' existe
    const supplierBucket = buckets.find(b => b.name === 'supplier-documents');
    if (supplierBucket) {
      console.log('\nBucket "supplier-documents" encontrado!');
    } else {
      console.log('\nBucket "supplier-documents" não encontrado. Tentando criar...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('supplier-documents', {
        public: true
      });
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError.message);
      } else {
        console.log('Bucket "supplier-documents" criado com sucesso!');
      }
    }
  } catch (e) {
    console.error('Erro inesperado:', e);
  }
}

testConnection();