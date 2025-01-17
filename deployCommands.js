import { GatewayDispatchEvents } from "discord-api-types/v10";
import { DiscordClient } from "./Utility/utilityConstants.js";
import { DISCORD_APP_USER_ID } from "./config.js";

// SLASH COMMANDS
// General
import * as HelpCommand from './Commands/SlashCommands/General/help.js';
import * as AddAppCommand from './Commands/SlashCommands/General/add-app.js';
import * as SupportCommand from './Commands/SlashCommands/General/support.js';
import * as NewsSubscribeCommand from './Commands/SlashCommands/General/news-subscribe.js';
// Management
import * as SetupCommand from './Commands/SlashCommands/Management/setup.js';

// Array for bulk-registering Commands
const AllCommands = [ 
    HelpCommand.SlashCommand.getRegisterData(), AddAppCommand.SlashCommand.getRegisterData(), SupportCommand.SlashCommand.getRegisterData(), NewsSubscribeCommand.SlashCommand.getRegisterData(),
    SetupCommand.SlashCommand.getRegisterData()
];


// Wait for Ready before (un)registering Commands
DiscordClient.once(GatewayDispatchEvents.Ready, async ({ data: readyData, api }) => {

    // Register single Command Globally
    await api.applicationCommands.createGlobalCommand(DISCORD_APP_USER_ID, SetupCommand.SlashCommand.getRegisterData());
    
    // Register single Command to a specific Guild
    //await api.applicationCommands.createGuildCommand(DISCORD_APP_USER_ID, 'GUILD_ID_PLACEHOLDER', COMMAND_PLACEHOLDER);

    // Bulk-register all Commands Globally
    //await api.applicationCommands.bulkOverwriteGlobalCommands(DISCORD_APP_USER_ID, AllCommands);
    
    // Bulk-unregister all Commands Globally
    //await api.applicationCommands.bulkOverwriteGlobalCommands(DISCORD_APP_USER_ID, []);

    console.log("Deployed!");
    process.exit();

});


//  Debugging and Error Logging
process.on('warning', console.warn);
process.on('unhandledRejection', console.error);
