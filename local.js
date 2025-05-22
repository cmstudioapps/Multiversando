(function() {
  'use strict';
  
  const CACHE_NAME = 'page-snapshot-cache-v1';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
  const IGNORED_KEYWORDS = ['chat', 'stream', 'realtime'];
  const SNAPSHOT_KEY = 'last-page-snapshot';
  
  class PageSnapshotCache {
    constructor() {
      this.initialized = false;
      this.activeFetches = 0;
      this.init().catch(console.error);
    }
    
    async init() {
      this.cache = await caches.open(CACHE_NAME);
      this.overrideFetch();
      this.initialized = true;
      console.log('[PageSnapshotCache] Initialized with page snapshotting');
      
      // Tenta restaurar snapshot ao carregar a página
      this.restoreSnapshot();
    }
    
    overrideFetch() {
      const originalFetch = window.fetch;
      
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        const shouldIgnore = IGNORED_KEYWORDS.some(kw => 
          url.toLowerCase().includes(kw.toLowerCase())
        );
        
        if (!shouldIgnore && this.isApiEndpoint(url)) {
          return this.handleCachedFetch(url, init);
        }
        
        return originalFetch(input, init);
      };
    }
    
    isApiEndpoint(url) {
      return url.includes('/api/') || 
             url.includes('api.vercel') || 
             url.endsWith('.json');
    }
    
    async handleCachedFetch(url, options) {
      // Verifica se temos um snapshot recente
      const snapshot = await this.getValidSnapshot();
      if (snapshot) {
        console.log('[PageSnapshotCache] Returning page from snapshot');
        return this.createMockResponse(snapshot.data[url]);
      }
      
      // Se não tiver snapshot válido, faz a requisição
      this.activeFetches++;
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Armazena os dados para o snapshot
        await this.storeResponseData(url, data);
        
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      } finally {
        this.activeFetches--;
        this.tryCreateSnapshot();
      }
    }
    
    async storeResponseData(url, data) {
      const existing = await this.cache.match(SNAPSHOT_KEY) || 
                       { json: () => ({ timestamp: 0, data: {} }) };
      const snapshot = await existing.json();
      
      snapshot.data[url] = data;
      await this.cache.put(SNAPSHOT_KEY, new Response(JSON.stringify(snapshot)));
    }
    
    async tryCreateSnapshot() {
      if (this.activeFetches > 0) return;
      
      const snapshot = {
        timestamp: Date.now(),
        data: {},
        html: document.documentElement.outerHTML
      };
      
      const existing = await this.cache.match(SNAPSHOT_KEY);
      if (existing) {
        const existingData = await existing.json();
        snapshot.data = existingData.data;
      }
      
      await this.cache.put(SNAPSHOT_KEY, new Response(JSON.stringify(snapshot)));
      console.log('[PageSnapshotCache] New page snapshot created');
    }
    
    async getValidSnapshot() {
      try {
        const response = await this.cache.match(SNAPSHOT_KEY);
        if (!response) return null;
        
        const snapshot = await response.json();
        if (Date.now() - snapshot.timestamp < CACHE_DURATION) {
          return snapshot;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    
    async restoreSnapshot() {
      const snapshot = await this.getValidSnapshot();
      if (snapshot) {
        console.log('[PageSnapshotCache] Restoring page from snapshot');
        document.documentElement.innerHTML = snapshot.html;
        
        // Dispara evento para scripts saberem que a página foi restaurada
        window.dispatchEvent(new Event('snapshotRestored'));
      }
    }
    
    createMockResponse(data) {
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Auto-inicialização
  window.PageSnapshotCache = new PageSnapshotCache();
})();