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

export const CartSchema = z
  .object({
    name: z.string(),
    birth: z.string(), // DOB, free text ("1980.05.10") — no mask in the form
    pass: z.string(), // passport series+number
    mail: z.string().optional(),
    phone: z.string(),
    departament: z.string(),
  })
  .loose();

export const FromabroadSchema = z.object({
  name: z.string(),
  phone: z.string(),
  mail: z.string().optional(),
  track_number: z.string(),
  amount: z.string(),
  departament: z.string(),
  name_Otpravitelya: z.string(),
  phone_otprav: z.string(),
  citi_otprav: z.string(),
  kto_oplachivaet: z.string(),
  TK: z.string(),          // not `required` in the form, but your buildBody sends it as "" → required is fine
  opisanie: z.string(),    // same — textarea has no `required`, but send the key
}).loose();

export const BankiRfSchema = z.object({
  name: z.string(),
  phone: z.string(),
  timechek: z.string(),   // column spelling: timechek (no 'c')
  amount: z.string(),
  metod: z.string(),
  dkarta: z.string(),
  nameP: z.string(),
  phoneP: z.string(),
  departament: z.string(),
}).loose();

export const CallBackSchema = z.object({
  name: z.string(),
  phone: z.string(),
}).loose();

export const MobileOfficeSchema = z.object({
  name: z.string(),
  phone: z.string(),
  departament: z.string(),
  opisanie: z.string(),
}).loose();
