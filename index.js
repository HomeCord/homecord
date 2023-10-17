const { RateLimitError, DMChannel, PartialGroupDMChannel } = require("discord.js");
const Mongoose = require("mongoose");
const fs = require("fs");
const { DiscordClient, Collections, checkPomelo } = require("./constants.js");
const Config = require("./config.js");



/******************************************************************************* */
// BRING IN FILES FOR COMMANDS AND INTERACTIONS
// Text Commands
const TextCommandFiles = fs.readdirSync("./TextCommands").filter(file => file.endsWith(".js"));
for ( const File of TextCommandFiles )
{
    const TempCommand = require(`./TextCommands/${File}`);
    Collections.TextCommands.set(TempCommand.Name, TempCommand);
}

// Slash Commands
const SlashCommandFiles = fs.readdirSync("./Interactions/SlashCommands").filter(file => file.endsWith(".js"));
for ( const File of SlashCommandFiles )
{
    const TempCommand = require(`./Interactions/SlashCommands/${File}`);
    Collections.SlashCommands.set(TempCommand.Name, TempCommand);
}

// Context Commands
const ContextCommandFiles = fs.readdirSync("./Interactions/ContextCommands").filter(file => file.endsWith(".js"));
for ( const File of ContextCommandFiles )
{
    const TempCommand = require(`./Interactions/ContextCommands/${File}`);
    Collections.ContextCommands.set(TempCommand.Name, TempCommand);
}

// Buttons
const ButtonFiles = fs.readdirSync("./Interactions/Buttons").filter(file => file.endsWith(".js"));
for ( const File of ButtonFiles )
{
    const TempButton = require(`./Interactions/Buttons/${File}`);
    Collections.Buttons.set(TempButton.Name, TempButton);
}

// Selects
const SelectFiles = fs.readdirSync("./Interactions/Selects").filter(file => file.endsWith(".js"));
for ( const File of SelectFiles )
{
    const TempSelect = require(`./Interactions/Selects/${File}`);
    Collections.Selects.set(TempSelect.Name, TempSelect);
}

// Modals
const ModalFiles = fs.readdirSync("./Interactions/Modals").filter(file => file.endsWith(".js"));
for ( const File of ModalFiles )
{
    const TempModal = require(`./Interactions/Modals/${File}`);
    Collections.Modals.set(TempModal.Name, TempModal);
}








/******************************************************************************* */
// DISCORD - READY EVENT
DiscordClient.once('ready', () => {
    DiscordClient.user.setPresence({ status: 'online' });
    console.log(`${checkPomelo(DiscordClient.user) ? `${DiscordClient.user.username}` : `${DiscordClient.user.username}#${DiscordClient.user.discriminator}`} is online and ready!`);
    return;
});








/******************************************************************************* */
// DEBUGGING AND ERROR LOGGING
// Warnings
process.on('warning', (warning) => { console.warn("***WARNING: ", warning); return; });
DiscordClient.on('warn', (warning) => { console.warn("***DISCORD WARNING: ", warning); return; });

// Unhandled Promise Rejections
process.on('unhandledRejection', (err) => { console.error("***UNHANDLED PROMISE REJECTION: ", err); return; });

// Discord Errors
DiscordClient.on('error', (err) => { console.error("***DISCORD ERROR: ", err); return; });

// Discord Rate Limit - Only uncomment when debugging
//DiscordClient.rest.on('rateLimited', (RateLimitError) => { console.log("***DISCORD RATELIMIT HIT: ", RateLimitError); return; });

// Mongoose Errors
Mongoose.connection.on('error', console.error);








/******************************************************************************* */
// DISCORD - MESSAGE CREATE EVENT
const TextCommandHandler = require("./BotModules/Handlers/TextCommandHandler.js");

DiscordClient.on('messageCreate', async (message) => {
    // Partials
    if ( message.partial ) { await message.fetch(); }

    // Bots
    if ( message.author.bot ) { return; }

    // System Messages
    if ( message.system || message.author.system ) { return; }

    // DM Channel Messages
    if ( message.channel instanceof DMChannel ) { return; }
    if ( message.channel instanceof PartialGroupDMChannel ) { return; }

    // Safe-guard against Discord Outages
    if ( !message.guild.available ) { return; }



    // Check for (and handle) Commands
    let textCommandStatus = await TextCommandHandler.Main(message);
    if ( textCommandStatus === false )
    {
        // No Command detected
        return;
    }
    else if ( textCommandStatus === null )
    {
        // Prefix was detected, but wasn't a command on the bot
        return;
    }
    else
    {
        // Command failed or successful
        return;
    }
});








/******************************************************************************* */
// DISCORD - INTERACTION CREATE EVENT
const SlashCommandHandler = require("./BotModules/Handlers/SlashCommandHandler.js");
const ContextCommandHandler = require("./BotModules/Handlers/ContextCommandHandler.js");
const ButtonHandler = require("./BotModules/Handlers/ButtonHandler.js");
const SelectHandler = require("./BotModules/Handlers/SelectHandler.js");
const AutocompleteHandler = require("./BotModules/Handlers/AutocompleteHandler.js");
const ModalHandler = require("./BotModules/Handlers/ModalHandler.js");

DiscordClient.on('interactionCreate', async (interaction) => {
    if ( interaction.isChatInputCommand() )
    {
        // Slash Command
        await SlashCommandHandler.Main(interaction);
        return;
    }
    else if ( interaction.isContextMenuCommand() )
    {
        // Context Command
        await ContextCommandHandler.Main(interaction);
        return;
    }
    else if ( interaction.isButton() )
    {
        // Button
        await ButtonHandler.Main(interaction);
        return;
    }
    else if ( interaction.isAnySelectMenu() )
    {
        // Select
        await SelectHandler.Main(interaction);
        return;
    }
    else if ( interaction.isAutocomplete() )
    {
        // Autocomplete
        await AutocompleteHandler.Main(interaction);
        return;
    }
    else if ( interaction.isModalSubmit() )
    {
        // Modal
        await ModalHandler.Main(interaction);
        return;
    }
    else
    {
        // Unknown or unhandled new type of Interaction
        console.log(`****Unrecognised or new unhandled Interaction type triggered:\n${interaction.type}\n${interaction}`);
        return;
    }
});








/******************************************************************************* */

DiscordClient.login(Config.TOKEN).catch(console.error); // Login to and start the Discord Bot Client
Mongoose.connect(Config.MongoString).catch(console.error);
