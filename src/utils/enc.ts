import { AnyObject } from "../typing/types";
import { decrypt, encrypt } from "./encrypt";
import { decryptObject, encryptObject } from "./encryptObject";

export const toReadable = (fromBase: string, passphrase: string): AnyObject => {
  return decryptObject(JSON.parse(decrypt(fromBase, passphrase)), passphrase);
};

export const toBase = (object: AnyObject, passphrase: string): string => {
  return encrypt(JSON.stringify(encryptObject(object, passphrase)), passphrase);
};
