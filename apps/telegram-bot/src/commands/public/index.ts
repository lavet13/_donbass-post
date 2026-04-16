import { startCommand } from "./start";
import { getChatIdCommand } from "./getchatid";
import { helpCommand } from "./help";
import { publicCommands } from "@/commands/groups";

publicCommands.add([startCommand, getChatIdCommand, helpCommand]);
