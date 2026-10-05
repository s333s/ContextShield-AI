// ContextShield AI — Website Adapters
// Robust DOM detection for ChatGPT, Gemini, and Claude.
// Uses multiple selectors and heuristics rather than one fragile CSS selector.

export class WebsiteAdapter {
  name = 'generic';

  isMatch(): boolean {
    return false;
  }

  findPromptInput(): HTMLTextAreaElement | HTMLInputElement | null {
    return null;
  }

  getPromptText(): string {
    return '';
  }

  setPromptText(text: string): void {}

  findSubmitButton(): HTMLElement | null {
    return null;
  }

  insertButton(target: HTMLElement): void {}
}

export class ChatGPTAdapter extends WebsiteAdapter {
  name = 'chatgpt';

  private selectors = [
    'textarea[data-id]',
    'textarea#prompt-textarea',
    'div[contenteditable="true"][id*="prompt"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"][role="textbox"]',
  ];

  isMatch(): boolean {
    return (
      window.location.hostname.includes('chat.openai.com') ||
      window.location.hostname.includes('chatgpt.com')
    );
  }

  findPromptInput(): HTMLTextAreaElement | HTMLInputElement | null {
    for (const sel of this.selectors) {
      const el = document.querySelector(sel);
      if (el && this.isEditable(el)) {
        return el as HTMLTextAreaElement;
      }
    }
    // Fallback: find any visible textarea or contenteditable div near the bottom
    const textareas = document.querySelectorAll('textarea, div[contenteditable="true"]');
    for (const ta of textareas) {
      if (this.isEditable(ta) && this.isNearBottom(ta)) {
        return ta as HTMLTextAreaElement;
      }
    }
    return null;
  }

  getPromptText(): string {
    const input = this.findPromptInput();
    if (!input) return '';
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      return (input as HTMLTextAreaElement).value;
    }
    return input.textContent || '';
  }

  setPromptText(text: string): void {
    const input = this.findPromptInput();
    if (!input) return;

    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.textContent = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
    }
  }

  findSubmitButton(): HTMLElement | null {
    const selectors = [
      'button[data-testid="send-button"]',
      'button[aria-label*="Send"]',
      'button[type="submit"]',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) return btn as HTMLElement;
    }
    return null;
  }

  private isEditable(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private isNearBottom(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    return rect.top > window.innerHeight * 0.5;
  }

  insertButton(target: HTMLElement): void {
    // Insert ContextShield button next to the prompt input
    target.appendChild(this.createShieldButton());
  }

  private createShieldButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.id = 'contextshield-scan-btn';
    btn.innerHTML = '🛡️ Scan';
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    return btn;
  }
}

export class GeminiAdapter extends WebsiteAdapter {
  name = 'gemini';

  private selectors = [
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"][aria-label*="Prompt"]',
    'rich-textarea',
    '.ql-editor[contenteditable="true"]',
  ];

  isMatch(): boolean {
    return window.location.hostname.includes('gemini.google.com');
  }

  findPromptInput(): HTMLTextAreaElement | HTMLInputElement | null {
    for (const sel of this.selectors) {
      const el = document.querySelector(sel);
      if (el) return el as HTMLTextAreaElement;
    }
    const editable = document.querySelector('div[contenteditable="true"]');
    return editable as HTMLTextAreaElement;
  }

  getPromptText(): string {
    const input = this.findPromptInput();
    return input?.textContent || '';
  }

  setPromptText(text: string): void {
    const input = this.findPromptInput();
    if (!input) return;
    input.textContent = text;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
  }

  findSubmitButton(): HTMLElement | null {
    const selectors = [
      'button[aria-label*="Send"]',
      'button[aria-label*="send message"]',
      '.send-button',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) return btn as HTMLElement;
    }
    return null;
  }

  insertButton(target: HTMLElement): void {
    target.appendChild(this.createShieldButton());
  }

  private createShieldButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.id = 'contextshield-scan-btn';
    btn.innerHTML = '🛡️ Scan';
    btn.style.cssText = `
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid rgba(34,197,94,0.3);
      background: rgba(34,197,94,0.1); color: #22c55e;
      font-size: 12px; font-weight: 600; cursor: pointer;
    `;
    return btn;
  }
}

export class ClaudeAdapter extends WebsiteAdapter {
  name = 'claude';

  private selectors = [
    'div[contenteditable="true"][role="textbox"]',
    'div.ProseMirror[contenteditable="true"]',
    'textarea[placeholder*="How can"]',
    'div[contenteditable="true"]',
  ];

  isMatch(): boolean {
    return window.location.hostname.includes('claude.ai');
  }

  findPromptInput(): HTMLTextAreaElement | HTMLInputElement | null {
    for (const sel of this.selectors) {
      const el = document.querySelector(sel);
      if (el) return el as HTMLTextAreaElement;
    }
    return null;
  }

  getPromptText(): string {
    const input = this.findPromptInput();
    return input?.textContent || input?.value || '';
  }

  setPromptText(text: string): void {
    const input = this.findPromptInput();
    if (!input) return;
    if (input.tagName === 'TEXTAREA') {
      (input as HTMLTextAreaElement).value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.textContent = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
    }
  }

  findSubmitButton(): HTMLElement | null {
    const selectors = [
      'button[aria-label*="Send"]',
      'button[type="submit"]',
      'button[aria-label*="send"]',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) return btn as HTMLElement;
    }
    return null;
  }

  insertButton(target: HTMLElement): void {
    target.appendChild(this.createShieldButton());
  }

  private createShieldButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.id = 'contextshield-scan-btn';
    btn.innerHTML = '🛡️ Scan';
    btn.style.cssText = `
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid rgba(34,197,94,0.3);
      background: rgba(34,197,94,0.1); color: #22c55e;
      font-size: 12px; font-weight: 600; cursor: pointer;
    `;
    return btn;
  }
}

export function getAdapter(): WebsiteAdapter {
  const adapters = [new ChatGPTAdapter(), new GeminiAdapter(), new ClaudeAdapter()];
  return adapters.find((a) => a.isMatch()) || new WebsiteAdapter();
}
