import { managerCommands } from "@/commands/groups";
import { statusCommand } from "./status";
import { preferencesCommand } from "./preferences";

managerCommands.add([statusCommand, preferencesCommand]);
