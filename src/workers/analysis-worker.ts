// Sandbox: override dangerous globals
(self as any).fetch = () => { throw new Error('Not allowed'); };
(self as any).XMLHttpRequest = function() { throw new Error('Not allowed'); };
(self as any).importScripts = () => { throw new Error('Not allowed'); };
(self as any).WebSocket = function() { throw new Error('Not allowed'); };
(self as any).EventSource = function() { throw new Error('Not allowed'); };

self.onmessage = (e: MessageEvent) => {
  const { code, data } = e.data;

  const timeout = setTimeout(() => {
    self.postMessage({ success: false, error: 'Analysis timed out (10s limit)' });
  }, 10000);

  try {
    // The AI sometimes wraps code in a function expression — unwrap it
    let cleanCode = code.trim();
    // Match: function(data) { ... } or function (data) { ... }
    const fnWrapMatch = cleanCode.match(/^function\s*\([\w\s,]*\)\s*\{([\s\S]*)\}\s*$/);
    if (fnWrapMatch) {
      cleanCode = fnWrapMatch[1];
    }
    // Match: (data) => { ... } or data => { ... }
    const arrowMatch = cleanCode.match(/^(?:\([\w\s,]*\)|[\w]+)\s*=>\s*\{([\s\S]*)\}\s*$/);
    if (arrowMatch) {
      cleanCode = arrowMatch[1];
    }

    const fn = new Function('data', cleanCode);
    const result = fn(data);
    clearTimeout(timeout);
    self.postMessage({ success: true, result });
  } catch (err: any) {
    clearTimeout(timeout);
    self.postMessage({ success: false, error: err.message || String(err) });
  }
};
