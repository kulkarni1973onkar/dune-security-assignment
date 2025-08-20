function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}


export function trimAll<T>(val: T): T {
  if (typeof val === 'string') {
    return val.trim() as unknown as T;
  }

  if (Array.isArray(val)) {
    const next = (val as unknown[]).map((v) => trimAll(v));
    return next as unknown as T;
  }

  if (isPlainObject(val)) {
    const source = val as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(source)) {
      out[k] = trimAll(v);
    }
    return out as unknown as T;
  }

  
  return val;
}
