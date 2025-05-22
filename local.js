(function() {
  'use strict';
  
  const CACHE_NAME = 'smart-api-cache-v2';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  const IGNORED_KEYWORDS = ['chat', 'stream', 'realtime'];
  const firstRequestMap = new Map(); // Rastreia primeiras requisições

  class SmartApi {
    constructor() {
      this.initialized = false;
      this.init().catch(console.error);
    }
    
    async init() {
      this.cache = await caches.open(CACHE_NAME);
      this.overrideFetch();
      this.initialized = true;
      console.log('[SmartApi] Initialized - First request always allowed');
    }
    
    overrideFetch() {
      const originalFetch = window.fetch;
      
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        
        // Verifica se é um endpoint ignorado
        const shouldIgnore = IGNORED_KEYWORDS.some(kw => 
          url.toLowerCase().includes(kw.toLowerCase())
        );
        
        // Se não for ignorado e for uma API endpoint, usa cache
        if (!shouldIgnore && this.isApiEndpoint(url)) {
          return this.handleCachedFetch(url, init, shouldIgnore);
        }
        
        // Padrão: fetch normal
        return originalFetch(input, init);
      };
    }
    
    isApiEndpoint(url) {
      return url.includes('/api/') || 
             url.includes('api.vercel') || 
             url.includes('api.example.com');
    }
    
    async handleCachedFetch(url, options, shouldIgnore) {
      try {
        // Verifica se é a primeira requisição para este URL
        const isFirstRequest = !firstRequestMap.has(url);
        
        if (isFirstRequest) {
          firstRequestMap.set(url, true);
          console.log(`[SmartApi] First request to ${url} - bypassing cache`);
          const response = await fetch(url, options);
          
          // Cache a resposta mesmo sendo a primeira requisição
          if (response.ok) {
            const data = await response.clone().json();
            await this.cache.put(url, new Response(JSON.stringify({
              data,
              timestamp: Date.now()
            })));
          }
          
          return response;
        }
        
        // Não é primeira requisição - lógica normal de cache
        const cached = await this.cache.match(url);
        
        if (cached) {
          const { data, timestamp } = await cached.json();
          
          // Se o cache for recente, retorna ele
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`[SmartApi] Returning cached data for ${url}`);
            return new Response(JSON.stringify(data), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Faz nova requisição se o cache estiver expirado
        console.log(`[SmartApi] Cache expired/missing for ${url} - fetching fresh`);
        const response = await fetch(url, options);
        
        if (response.ok) {
          const data = await response.clone().json();
          await this.cache.put(url, new Response(JSON.stringify({
            data,
            timestamp: Date.now()
          })));
        }
        
        return response;
      } catch (error) {
        console.error('[SmartApi] Fetch error:', error);
        
        // Fallback para cache mesmo que expirado
        const cached = await this.cache.match(url);
        if (cached) {
          const { data } = await cached.json();
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        throw error;
      }
    }
  }
  
  // Auto-inicialização
  window.SmartApi = new SmartApi();
})();