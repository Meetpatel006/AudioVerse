// JWT implementation using Web Crypto API for Edge Runtime compatibility

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key';

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert Base64 URL to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = base64Url.replace(/\-/g, '+').replace(/_/g, '/') + padding;
  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  
  return buffer;
}

// Convert Uint8Array to Base64 URL
function uint8ArrayToBase64Url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Generate a key from the secret
async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
    if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
      throw new Error('Invalid token format');
    }

    // Create the data to verify
    const data = stringToUint8Array(`${headerEncoded}.${payloadEncoded}`);
    const signature = base64UrlToUint8Array(signatureEncoded);
    
    // Get the key
    const key = await getKey(JWT_SECRET);
    
    // Verify the signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Parse the payload
    const payload = JSON.parse(atob(payloadEncoded)) as TokenPayload;
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function generateToken(userId: string): Promise<string> {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    };

    // Encode header and payload
    const headerEncoded = btoa(JSON.stringify(header)).replace(/=+$/, '');
    const payloadEncoded = btoa(JSON.stringify(payload)).replace(/=+$/, '');
    
    // Create the data to sign
    const data = stringToUint8Array(`${headerEncoded}.${payloadEncoded}`);
    
    // Get the key and sign the data
    const key = await getKey(JWT_SECRET);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    
    // Convert the signature to Base64 URL
    const signatureEncoded = uint8ArrayToBase64Url(new Uint8Array(signature));

    return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
  } catch (error) {
    console.error('Token generation failed:', error);
    throw error;
  }
}
