import { z } from "zod";

export const cryptoSwapSchema = z.object({
  from: z.string().min(1, { message: "Select a crypto" }),
  to: z.string().min(1, { message: "Select a crypto" }),
  amount: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const str = String(val).trim();
      if (str === "") return undefined;
      const num = Number(str);
      return isNaN(num) ? str : num;
    },
    z.union([z.number(), z.string(), z.undefined()])
  ).refine((val) => val !== undefined, { message: "Amount is required" })
    .refine((val) => {
      if (val === undefined) return false;
      if (typeof val === "string") return false;
      return val > 0;
    }, { message: "Amount must be a valid number greater than 0" }) as unknown as z.ZodNumber,
});

export type CryptoSwapSchema = z.infer<typeof cryptoSwapSchema>;
