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

export const AliJoomSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    mail: z.string().optional(), // "0" is valid here — no email validation
    departament: z.string(), // already prefixed by the client's buildBody
    links: z.string(),
    amount: z.string(),
    opisanie: z.string(),
    razmer: z.string(),
    color: z.string(),
    colvo: z.string(),
  })
  .loose();

export const DostavkaRusSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    mail: z.string().optional(), // "0" is valid here — no email validation
    departament: z.string(),
    links: z.string(),
    amount: z.string(),
    opisanie: z.string(),
  })
  .loose();

export const IzRfSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    mail: z.string().optional(), // "0" is valid here — no email validation
    departament: z.string(),
    citi_otprav: z.string().optional(),
    TK: z.string(),
    track_number: z.string(),
    name_Otpravitelya: z.string().optional(),
    phone_otprav: z.string().optional(),
    kto_oplachivaet: z.string().optional(),
    VIP: z.string(),
    opisanie: z.string(),
  })
  .loose();
