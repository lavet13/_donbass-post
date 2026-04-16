import { adminCommands } from "@/commands/groups";
import { addManagerCommand } from "./addmanager";
import { managersCommand } from "./managers";
import { removeManagerCommand } from "./removemanager";
import { appendPreferenceCommand } from "./appendpreference";
import { setPreferenceCommand } from "./setpreference";
import { removePreferenceCommand } from "./removepreference";
import { allPreferencesCommand } from "./allpreferences";

adminCommands.add([
  managersCommand,
  addManagerCommand,
  removeManagerCommand,
  appendPreferenceCommand,
  removePreferenceCommand,
  setPreferenceCommand,
  allPreferencesCommand,
]);
