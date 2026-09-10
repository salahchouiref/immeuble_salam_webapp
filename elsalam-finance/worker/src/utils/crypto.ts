// Password hashing using Web Crypto API (PBKDF2)

function base64ToHex(base64: string): string {
  const binary = atob(base64);
  return [...binary].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  let binary = '';
  salt.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const bitsArray = new Uint8Array(bits);
  let bitsBinary = '';
  bitsArray.forEach(b => bitsBinary += String.fromCharCode(b));
  const hashHex = base64ToHex(btoa(bitsBinary));
  return `${salt}:${btoa(bitsBinary)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(':');
    const encoder = new TextEncoder();
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const bitsArray = new Uint8Array(bits);
    let bitsBinary = '';
    bitsArray.forEach(b => bitsBinary += String.fromCharCode(b));
    const newHash = btoa(bitsBinary);
    return newHash === hash;
  } catch {
    return false;
  }
}
