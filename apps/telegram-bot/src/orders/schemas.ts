import { col } from "@/validation/fields";
import { z } from "zod";

export const AliexpressTestSchema = z
  .object({
    name: col(255),
    phone: col(255),
    mail: col(255).optional(), // "0" is valid here — no email validation
    departament: col(255), // already prefixed by the client's buildBody
    links: col(2500),
    amount: col(255),
    track_number: col(255),
    VIP: col(255),
  })
  .loose();

export const AliJoomSchema = z
  .object({
    name: col(255),
    phone: col(255),
    mail: col(255).optional(), // "0" is valid here — no email validation
    departament: col(255), // already prefixed by the client's buildBody
    links: col(2500),
    amount: col(255),
    opisanie: col(2500),
    razmer: col(255),
    color: col(255),
    colvo: col(255),
  })
  .loose();

export const DostavkaRusSchema = z
  .object({
    name: col(255),
    phone: col(255),
    mail: col(255).optional(), // "0" is valid here — no email validation
    departament: col(255),
    links: col(2500),
    amount: col(255),
    opisanie: col(2500),
  })
  .loose();

export const IzRfSchema = z
  .object({
    name: col(255),
    phone: col(255),
    mail: col(255).optional(), // "0" is valid here — no email validation
    departament: col(255),
    citi_otprav: col(255).optional(),
    TK: col(255),
    track_number: col(255),
    links: col(2500).optional(),
    amount: col(255).optional(),
    name_Otpravitelya: col(255).optional(),
    phone_otprav: col(255).optional(),
    kto_oplachivaet: col(255).optional(),
    VIP: col(255).optional(),
    opisanie: col(1500).optional(),
  })
  .loose();

export const CartSchema = z
  .object({
    name: col(255),
    birth: col(255), // DOB, free text ("1980.05.10") — no mask in the form
    pass: col(255), // passport series+number
    mail: col(255).optional(),
    phone: col(255),
    departament: col(255),
  })
  .loose();

export const FromabroadSchema = z.object({
  name: col(255),
  phone: col(255),
  mail: col(255).optional(),
  track_number: col(255),
  amount: col(255),
  departament: col(255),
  name_Otpravitelya: col(255),
  phone_otprav: col(255),
  citi_otprav: col(255),
  kto_oplachivaet: col(255),
  TK: col(255),          // not `required` in the form, but your buildBody sends it as "" → required is fine
  opisanie: col(1500),    // same — textarea has no `required`, but send the key
}).loose();

export const BankiRfSchema = z.object({
  name: col(255),
  phone: col(255),
  timechek: col(255),   // column spelling: timechek (no 'c')
  amount: col(255),
  metod: col(255),
  dkarta: col(255),
  nameP: col(255),
  phoneP: col(255),
  departament: col(255),
}).loose();

export const CallBackSchema = z.object({
  name: col(255),
  phone: col(255),
}).loose();

export const MobileOfficeSchema = z.object({
  name: col(255),
  phone: col(255),
  departament: col(255),
  opisanie: col(1500),
}).loose();
