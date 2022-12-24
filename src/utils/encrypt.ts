import { SECRET_PASS } from "../config";
import { AES, lib, enc } from "crypto-js";

export const encrypt = <T extends string | number | boolean>(
  str: T,
  passphrase?: string
): T => {
  if (!str && str !== 0) return str;
  if (typeof str === "string")
    return AES.encrypt(`${str}`, passphrase || SECRET_PASS).toString() as any;
  return str;
};

export const decrypt = <T extends string | number | boolean>(
  str: T,
  passphrase?: string
): T => {
  if (!str && str !== 0) return str;
  if (typeof str === "string")
    return AES.decrypt(`${str}`, passphrase || SECRET_PASS).toString(
      enc.Utf8
    ) as any;
  return str;
};
