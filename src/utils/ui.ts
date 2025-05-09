/**
 * Utility functions for UI operations
 */

/**
 * Shows a button feedback message and reverts back after a delay
 */
export function showButtonFeedback(
  button: HTMLButtonElement,
  message: string,
  originalText: string,
  delay: number = 1500,
  disableButton: boolean = true,
): void {
  const originalDisabledState = button.disabled;

  button.textContent = message;
  if (disableButton) {
    button.disabled = true;
  }

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = originalDisabledState;
  }, delay);
}

/**
 * Creates and returns a DOM element with the given properties
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: {
    className?: string;
    textContent?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    children?: HTMLElement[];
    eventListeners?: {
      type: string;
      listener: EventListenerOrEventListenerObject;
    }[];
  } = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.styles) {
    for (const [key, value] of Object.entries(options.styles)) {
      // Type assertion needed because key can be any style property
      (element.style as unknown as Record<string, unknown>)[key] = value;
    }
  }

  if (options.eventListeners) {
    for (const { type, listener } of options.eventListeners) {
      element.addEventListener(type, listener);
    }
  }

  if (options.children) {
    for (const child of options.children) {
      element.appendChild(child);
    }
  }

  return element;
}
