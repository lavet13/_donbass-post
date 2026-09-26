import { z } from "zod";

export const AliexpressTestSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    mail: z.string().optional(), // "0" is valid here — no email validation
    departament: z.string(), // already prefixed by the client's buildBody
    links: z.string(),
    amount: z.string(),
    track_number: z.string(),
    VIP: z.string(),
  })
  .loose();
