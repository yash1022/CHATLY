// Helper functions for creating and serializing AES-GCM keys via Web Crypto API.

const getSubtleCrypto = () => {
	if (globalThis?.crypto?.subtle) return globalThis.crypto.subtle;
	if (typeof window !== 'undefined' && window.crypto?.subtle) return window.crypto.subtle;
	throw new Error('Web Crypto API SubtleCrypto interface is unavailable in this environment.');
};

const subtle = getSubtleCrypto();

const AES_GCM_PARAMS = { name: 'AES-GCM', length: 256 };

export const generateAesKey = async (extractable = true) => {
	return subtle.generateKey(AES_GCM_PARAMS, extractable, ['encrypt', 'decrypt']);
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
	const view = new Uint8Array(buffer);
	let binary = '';
	view.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return base64Encode(binary);
};

const base64ToArrayBuffer = (base64) => {
	const binary = base64Decode(base64);
	const view = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		view[i] = binary.charCodeAt(i);
	}
	return view.buffer;
};                      

export const exportAesKeyToBase64 = async (key) => {
	const raw = await subtle.exportKey('raw', key);
	return arrayBufferToBase64(raw);
};

export const importAesKeyFromBase64 = async (base64, extractable = true) => {
	const raw = base64ToArrayBuffer(base64);
	return subtle.importKey('raw', raw, AES_GCM_PARAMS, extractable, ['encrypt', 'decrypt']);
};

export const encryptMessage = async(key,plaintext)=>{
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const encoder = new TextEncoder();
    const encodedPlaintext = encoder.encode(plaintext);

    const ciphertext = await subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedPlaintext
    );

    return {
        iv: arrayBufferToBase64(iv.buffer),
        ciphertext: arrayBufferToBase64(ciphertext)
    };
}   

export const decryptMessage = async(aesKey,ivBase64,ciphertextBase64)=>{
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);

    const decrypted = await subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}