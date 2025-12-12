import { generateKeyPairSync } from "crypto";

export const generateKeyPair = () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");

  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }),
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }),
  };
};
