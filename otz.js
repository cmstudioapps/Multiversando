/**
 * LoadPriorityJS - Biblioteca de otimização de carregamento de recursos
 * Versão: 1.0.0
 * Descrição: Prioriza carregamento de JS local, adia scripts externos e otimiza fetch
 */

class LoadPriorityJS {
  constructor() {
    this.localScripts = [];
    this.externalScripts = [];
    this.stylesheets = [];
    this.resourceMap = new Map();
    this.observedElements = new WeakSet();
    this.intersectionObserver = null;
    this.priorityFetchQueue = [];
    this.idleCallback = null;
    this.isIdle = false;
    
    this.init();
  }

  /**
   * Inicializa a biblioteca
   */
  init() {
    this.setupObservers();
    this.analyzeExistingResources();
    this.processDOM();
    this.setupEventListeners();
    
    // Inicia o processamento em idle time
    this.scheduleIdleProcessing();
  }

  /**
   * Configura observers para elementos dinâmicos
   */
  setupObservers() {
    // Observer para mudanças no DOM
    const domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            this.processNewElement(node);
          }
        });
      });
    });

    domObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Intersection Observer para carregamento lazy
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadDeferredResource(entry.target);
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px 0px'
    });
  }

  /**
   * Analisa recursos existentes no DOM
   */
  analyeExistingResources() {
    document.querySelectorAll('script, link, img, iframe').forEach(el => {
      this.classifyResource(el);
    });
  }

  /**
   * Processa o DOM inicial
   */
  processDOM() {
    // Reordena scripts para priorizar locais
    this.reorderScripts();
    
    // Carrega estilos críticos primeiro
    this.loadCriticalCSS();
    
    // Inicia carregamento de recursos locais
    this.loadLocalResources();
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.onDOMContentLoaded();
    });

    window.addEventListener('load', () => {
      this.onWindowLoad();
    });
  }

  /**
   * Agenda processamento durante idle time
   */
  scheduleIdleProcessing() {
    if ('requestIdleCallback' in window) {
      this.idleCallback = window.requestIdleCallback((deadline) => {
        this.isIdle = true;
        this.processIdleTasks(deadline);
      }, { timeout: 2000 });
    } else {
      // Fallback para browsers sem requestIdleCallback
      setTimeout(() => {
        this.processIdleTasks({ timeRemaining: () => 50 });
      }, 3000);
    }
  }

  /**
   * Processa tarefas durante idle time
   */
  processIdleTasks(deadline) {
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && this.priorityFetchQueue.length > 0) {
      const task = this.priorityFetchQueue.shift();
      task();
    }

    if (this.priorityFetchQueue.length > 0) {
      this.idleCallback = window.requestIdleCallback((newDeadline) => {
        this.processIdleTasks(newDeadline);
      });
    } else {
      this.isIdle = false;
    }
  }

  /**
   * Classifica um recurso como local ou externo
   */
  classifyResource(element) {
    if (this.observedElements.has(element)) return;
    
    const tagName = element.tagName.toLowerCase();
    const isExternal = this.isExternalResource(element);
    
    if (tagName === 'script') {
      if (isExternal) {
        this.externalScripts.push(element);
        this.deferScript(element);
      } else {
        this.localScripts.push(element);
      }
    } else if (tagName === 'link' && element.rel === 'stylesheet') {
      this.stylesheets.push(element);
      if (isExternal) {
        this.deferStylesheet(element);
      }
    } else if ((tagName === 'img' || tagName === 'iframe') && isExternal) {
      this.deferMediaElement(element);
    }
    
    this.observedElements.add(element);
  }

  /**
   * Verifica se um recurso é externo
   */
  isExternalResource(element) {
    const url = element.src || element.href;
    if (!url) return false;
    
    return !url.startsWith(window.location.origin) && 
           !url.startsWith('/') && 
           !url.startsWith('./') && 
           !url.startsWith('../');
  }

  /**
   * Reordena scripts para priorizar locais
   */
  reorderScripts() {
    const head = document.head;
    const body = document.body;
    
    // Move scripts locais para o início do head
    this.localScripts.forEach(script => {
      if (script.parentNode) {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        
        // Copia atributos importantes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        head.insertBefore(newScript, head.firstChild);
        script.remove();
      }
    });
  }

  /**
   * Carrega CSS crítico primeiro
   */
  loadCriticalCSS() {
    // Implementação básica - pode ser estendida para extrair CSS crítico
    this.stylesheets.forEach(style => {
      if (!this.isExternalResource(style)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = style.href;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Carrega recursos locais prioritários
   */
  loadLocalResources() {
    this.localScripts.forEach(script => {
      if (!script.src || script.src.startsWith(window.location.origin)) {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      }
    });
  }

  /**
   * Adia carregamento de script externo
   */
  deferScript(script) {
    if (script.parentNode) {
      script.setAttribute('defer', '');
      script.setAttribute('data-priority', 'low');
    }
  }

  /**
   * Adia carregamento de stylesheet externo
   */
  deferStylesheet(stylesheet) {
    if (stylesheet.parentNode) {
      const media = stylesheet.media || 'all';
      stylesheet.media = 'print';
      stylesheet.onload = () => {
        stylesheet.media = media;
      };
      
      // Carrega quando ocioso
      this.priorityFetchQueue.push(() => {
        stylesheet.media = media;
      });
    }
  }

  /**
   * Adia carregamento de elementos de mídia
   */
  deferMediaElement(element) {
    if (element.tagName.toLowerCase() === 'img') {
      element.loading = 'lazy';
    }
    this.intersectionObserver.observe(element);
  }

  /**
   * Carrega recurso adiado quando visível
   */
  loadDeferredResource(element) {
    if (element.tagName.toLowerCase() === 'img' && element.dataset.src) {
      element.src = element.dataset.src;
    }
  }

  /**
   * Processa novo elemento adicionado ao DOM
   */
  processNewElement(element) {
    if (element.tagName) {
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'script' || tagName === 'link' || tagName === 'img' || tagName === 'iframe') {
        this.classifyResource(element);
      }
      
      // Verifica elementos filhos
      element.querySelectorAll('script, link, img, iframe').forEach(child => {
        this.classifyResource(child);
      });
    }
  }

  /**
   * Handler para DOMContentLoaded
   */
  onDOMContentLoaded() {
    // Inicia carregamento de scripts externos não essenciais
    this.loadExternalScripts();
  }

  /**
   * Carrega scripts externos com baixa prioridade
   */
  loadExternalScripts() {
    this.externalScripts.forEach(script => {
      if (script.parentNode) {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        
        // Copia atributos
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Adiciona ao final do body
        document.body.appendChild(newScript);
        script.remove();
      }
    });
  }

  /**
   * Handler para window.load
   */
  onWindowLoad() {
    // Carrega quaisquer recursos restantes
    this.loadRemainingResources();
  }

  /**
   * Carrega recursos restantes de baixa prioridade
   */
  loadRemainingResources() {
    // Implementação pode ser estendida conforme necessário
  }

  /**
   * Fetch prioritário - substitui o fetch nativo para priorização
   */
  priorityFetch(url, options = {}) {
    const priority = options.priority || 'high';
    delete options.priority;
    
    if (priority === 'high' || !this.isIdle) {
      return fetch(url, options);
    } else {
      return new Promise((resolve, reject) => {
        this.priorityFetchQueue.push(() => {
          fetch(url, options)
            .then(resolve)
            .catch(reject);
        });
        
        if (this.idleCallback) {
          window.cancelIdleCallback(this.idleCallback);
        }
        this.scheduleIdleProcessing();
      });
    }
  }
}

// Exporta para diferentes ambientes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadPriorityJS;
} else if (typeof define === 'function' && define.amd) {
  define([], () => LoadPriorityJS);
} else {
  window.LoadPriorityJS = new LoadPriorityJS();
  
  // Substitui o fetch global pela versão prioritária
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (window.LoadPriorityJS) {
      return window.LoadPriorityJS.priorityFetch(url, options);
    }
    return originalFetch(url, options);
  };
}