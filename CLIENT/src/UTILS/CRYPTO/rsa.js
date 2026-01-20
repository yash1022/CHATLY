// Utility helpers for generating and exporting RSA-OAEP key pairs using the Web Crypto API.

const getSubtleCrypto = () => {
	if (globalThis?.crypto?.subtle) return globalThis.crypto.subtle;
	if (typeof window !== 'undefined' && window.crypto?.subtle) return window.crypto.subtle;
	throw new Error('Web Crypto API SubtleCrypto interface is unavailable in this environment.');
};

const RSA_OAEP_PARAMS = {
	name: 'RSA-OAEP',
	modulusLength: 2048,
	publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	hash: 'SHA-256',
};

const subtle = getSubtleCrypto();

const getLocalStorage = () => {
	if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
	if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
	throw new Error('localStorage is unavailable in this environment.');
};

export const generateRsaKeyPair = async (extractable = true) => {
	return subtle.generateKey(RSA_OAEP_PARAMS, extractable, ['encrypt', 'decrypt']);
};

const base64Encode = (binary) => {
	if (typeof btoa === 'function') return btoa(binary);
	if (typeof globalThis !== 'undefined' && typeof globalThis.btoa === 'function') {
		return globalThis.btoa(binary);
	}
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(binary, 'binary').toString('base64');
	}
	throw new Error('Base64 encoding is unavailable in this environment.');
};

const base64Decode = (base64) => {
	if (typeof atob === 'function') return atob(base64);
	if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
		return globalThis.atob(base64);
	}
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(base64, 'base64').toString('binary');
	}
	throw new Error('Base64 decoding is unavailable in this environment.');
};

const arrayBufferToBase64 = (buffer) => {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return base64Encode(binary);
};

const base64ToArrayBuffer = (base64) => {
	const binary = base64Decode(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
};

const wrapPem = (body, type) => {
	const formatted = body.match(/.{1,64}/g)?.join('\n') || body;
	return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
};

export const exportPublicKeyToPem = async (publicKey) => {
	const spki = await subtle.exportKey('spki', publicKey);
	return wrapPem(arrayBufferToBase64(spki), 'PUBLIC KEY');
};

export const exportPrivateKeyToPem = async (privateKey) => {
	const pkcs8 = await subtle.exportKey('pkcs8', privateKey);
	return wrapPem(arrayBufferToBase64(pkcs8), 'PRIVATE KEY');
};

const extractPemBody = (pem) => pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

export const importPublicKeyFromPem = async (pem, extractable = true) => {
	const body = extractPemBody(pem);
	const spki = base64ToArrayBuffer(body);
	return subtle.importKey('spki', spki, RSA_OAEP_PARAMS, extractable, ['encrypt']);
};

export const importPrivateKeyFromPem = async (pem, extractable = true) => {
	const body = extractPemBody(pem);
	const pkcs8 = base64ToArrayBuffer(body);
	return subtle.importKey('pkcs8', pkcs8, RSA_OAEP_PARAMS, extractable, ['decrypt']);
};

export const storeKeyPairInLocalStorage = async (publicKey, privateKey) => {
	const storage = getLocalStorage();
	const [publicPem, privatePem] = await Promise.all([
		exportPublicKeyToPem(publicKey),
		exportPrivateKeyToPem(privateKey),
	]);
	storage.setItem('rsa_public_key', publicPem);
	storage.setItem('rsa_private_key', privatePem);
	return { publicPem, privatePem };
};

export const loadKeyPairFromLocalStorage = async (extractable = true) => {
	const storage = getLocalStorage();
	const publicPem = storage.getItem('rsa_public_key');
	const privatePem = storage.getItem('rsa_private_key');
	if (!publicPem || !privatePem) return null;
	const [publicKey, privateKey] = await Promise.all([
		importPublicKeyFromPem(publicPem, extractable),
		importPrivateKeyFromPem(privatePem, extractable),
	]);
	return { publicKey, privateKey };
};

export async function encryptAesKey(aesKeyBase64, recieverPublicKey)
{
	const aesKeyBuffer = base64ToArrayBuffer(aesKeyBase64);
	const encryptedBuffer = await subtle.encrypt(
		{
			name: 'RSA-OAEP',
		},
		recieverPublicKey,
		aesKeyBuffer
	);
	return arrayBufferToBase64(encryptedBuffer);
}


export async function decryptAesKey(encryptedAesKeyBase64, privateKey)
{
	const encryptedBuffer = base64ToArrayBuffer(encryptedAesKeyBase64);
	const decryptedBuffer = await subtle.decrypt(
		{
			name: 'RSA-OAEP',	
		},
		privateKey,
		encryptedBuffer
	);
	return arrayBufferToBase64(decryptedBuffer);
}