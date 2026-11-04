
export const Helpers = {
  // Seleciona um elemento HTML
  select(selector, parent = document) {
    return parent.querySelector(selector);
  },

  // Seleciona vários elementos HTML
  selectAll(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  },

  // Mostra um elemento
  show(element) {
    const target = this.getElement(element);

    if (target) {
      target.classList.remove("hidden");
    }
  },

  // Esconde um elemento
  hide(element) {
    const target = this.getElement(element);

    if (target) {
      target.classList.add("hidden");
    }
  },

  // Alterna a visibilidade
  toggle(element) {
    const target = this.getElement(element);

    if (target) {
      target.classList.toggle("hidden");
    }
  },

  // Atualiza o texto de um elemento
  setText(element, text) {
    const target = this.getElement(element);

    if (target) {
      target.textContent = text;
    }
  },

  // Retorna o elemento recebido ou procura pelo seletor
  getElement(element) {
    if (typeof element === "string") {
      return document.querySelector(element);
    }

    return element;
  },

  // Formata uma data
  formatDate(date = new Date()) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  },

  // Aguarda determinado tempo
  wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  },

  // Gera um identificador único
  generateId() {
    return (
      globalThis.crypto?.randomUUID?.() ??
      `fireline-${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  },

  // Verifica se um elemento existe
  exists(selector) {
    return document.querySelector(selector) !== null;
  },

  // Adiciona uma classe
  addClass(element, className) {
    const target = this.getElement(element);

    target?.classList.add(className);
  },

  // Remove uma classe
  removeClass(element, className) {
    const target = this.getElement(element);

    target?.classList.remove(className);
  }
};
