import { type TContext } from "@/types/context";
import { CommandGroup, LanguageCodes } from "@grammyjs/commands";

export const LOCALES = [
  undefined,
  LanguageCodes.Russian,
  LanguageCodes.Ukrainian,
  LanguageCodes.English,
] as const;

export const publicCommands = new CommandGroup<TContext>();

export const adminCommands = new CommandGroup<TContext>();

export const managerCommands = new CommandGroup<TContext>();
