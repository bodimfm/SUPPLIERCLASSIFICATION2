// Teste e configuração para verificar e corrigir o Supabase Storage
const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas variáveis que estão no .env.local
const supabaseUrl = 'https://wzuodxgbqafqxmhlqhiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dW9keGdicWFmcXhtaGxxaGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDE0ODMsImV4cCI6MjA1OTIxNzQ4M30.TOvEHVuQnprGn2KQ6X81sDQ9fxJ3xpVJU2gVVcXkz-Y';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração de buckets
const BUCKET_CONFIG = {
  'supplier-documents': {
    public: true,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/msword', 'application/vnd.ms-excel'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  }
};

async function verifyAndCreateBuckets() {
  console.log('Verificando e configurando buckets do Supabase Storage...');
  
  try {
    // Listar buckets existentes
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erro ao listar buckets:', error.message);
      return;
    }
    
    console.log(`✅ Conexão com Supabase estabelecida! Encontrados ${buckets.length} buckets.`);
    
    // Mapear nomes de buckets existentes para fácil verificação
    const existingBuckets = new Map(buckets.map(b => [b.name, b]));
    
    // Verificar cada bucket configurado
    for (const [bucketName, config] of Object.entries(BUCKET_CONFIG)) {
      if (existingBuckets.has(bucketName)) {
        console.log(`🔍 Bucket "${bucketName}" já existe, verificando configuração...`);
        
        const bucket = existingBuckets.get(bucketName);
        if (bucket.public !== config.public) {
          console.log(`⚙️ Atualizando visibilidade do bucket "${bucketName}" para ${config.public ? 'público' : 'privado'}`);
          
          const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
            public: config.public
          });
          
          if (updateError) {
            console.error(`❌ Erro ao atualizar bucket "${bucketName}":`, updateError.message);
          } else {
            console.log(`✅ Bucket "${bucketName}" atualizado com sucesso!`);
          }
        } else {
          console.log(`✅ Bucket "${bucketName}" já está corretamente configurado como ${config.public ? 'público' : 'privado'}`);
        }
      } else {
        console.log(`🔧 Criando bucket "${bucketName}"...`);
        
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: config.public,
          fileSizeLimit: config.fileSizeLimit,
          allowedMimeTypes: config.allowedMimeTypes
        });
        
        if (createError) {
          console.error(`❌ Erro ao criar bucket "${bucketName}":`, createError.message);
        } else {
          console.log(`✅ Bucket "${bucketName}" criado com sucesso!`);
        }
      }
    }
    
    // Verificação final
    const { data: updatedBuckets } = await supabase.storage.listBuckets();
    console.log('\n🔍 Verificação final de buckets:');
    updatedBuckets.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });
    
    console.log('\n✅ Configuração de Storage concluída!');
    
    // Verificar permissões tentando fazer upload de um arquivo teste
    await testUploadPermissions();
    
  } catch (e) {
    console.error('❌ Erro inesperado:', e);
  }
}

async function testUploadPermissions() {
  console.log('\n🔍 Testando permissões de upload...');
  
  try {
    // Criar arquivo de teste simples
    const testFile = new Uint8Array([0, 1, 2, 3, 4]); // Arquivo binário simples
    const filePath = `test-${Date.now()}.bin`;
    
    // Tentar fazer upload para o bucket de documentos
    const { data, error } = await supabase.storage
      .from('supplier-documents')
      .upload(filePath, testFile, {
        contentType: 'application/octet-stream',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Teste de upload falhou:', error.message);
      console.error('   Isso pode indicar um problema de permissões ou configuração.');
      console.log('\n⚠️ Sugestões para resolver:');
      console.log('  1. Verifique as políticas de RLS no Supabase para storage');
      console.log('  2. Certifique-se de que a chave anon está correta');
      console.log('  3. Verifique os limites de CORS no projeto Supabase');
      return;
    }
    
    console.log('✅ Teste de upload bem-sucedido!');
    
    // Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('supplier-documents')
      .getPublicUrl(filePath);
    
    console.log(`   URL do arquivo: ${publicUrlData.publicUrl}`);
    
    // Limpar arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from('supplier-documents')
      .remove([filePath]);
    
    if (deleteError) {
      console.error('⚠️ Não foi possível excluir o arquivo de teste:', deleteError.message);
    } else {
      console.log('✅ Arquivo de teste excluído com sucesso');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de permissões:', error);
  }
}

// Executar verificação
verifyAndCreateBuckets();