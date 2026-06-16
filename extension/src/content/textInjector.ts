export function insertTextIntoField(field: HTMLElement, text: string) {
  if (!field) return;

  field.focus();

  // Try standard inputs and textareas
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    
    // Fallback for some inputs that don't support selection ranges natively
    try {
      field.setRangeText(text, start, end, 'end');
    } catch (e) {
      field.value = field.value.substring(0, start) + text + field.value.substring(end);
    }
    
    // Dispatch events so React/Vue/Angular forms detect the change
    field.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    field.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    return;
  }

  // Handle contenteditable fields (Notion, Gmail, Twitter, etc.)
  if (field.isContentEditable) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // document.execCommand is the most robust way to trigger input events in rich text editors
      document.execCommand('insertText', false, text);
    } else {
      // Fallback if no selection is active
      field.innerText += text;
      field.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }
  }
}
