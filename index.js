const { RateLimitError, DMChannel, PartialGroupDMChannel, MessageType, ChannelType } = require("discord.js");
const Mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");
const { DiscordClient, Collections, checkPomelo } = require("./constants.js");
const Config = require("./config.js");
const { LogWarn, LogError, LogInfo } = require("./BotModules/LoggingModule.js");
const { restartTimersOnStartup } = require("./BotModules/TimerModule.js");



// Just so its mutable
DiscordClient.DebugMode = false;



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
const SlashFoldersPath = path.join(__dirname, 'Interactions/SlashCommands');
const SlashCommandFolders = fs.readdirSync(SlashFoldersPath);

for ( const Folder of SlashCommandFolders )
{
    const SlashCommandsPath = path.join(SlashFoldersPath, Folder);
    const SlashCommandFiles = fs.readdirSync(SlashCommandsPath).filter(file => file.endsWith(".js"));
    
    for ( const File of SlashCommandFiles )
    {
        const FilePath = path.join(SlashCommandsPath, File);
        const TempCommand = require(FilePath);
        if ( 'execute' in TempCommand && 'registerData' in TempCommand ) { Collections.SlashCommands.set(TempCommand.Name, TempCommand); }
        else { console.warn(`[WARNING] The Slash Command at ${FilePath} is missing required "execute" or "registerData" methods.`); }
    }
}

// Context Commands
const ContextFoldersPath = path.join(__dirname, 'Interactions/ContextCommands');
const ContextCommandFolders = fs.readdirSync(ContextFoldersPath);

for ( const Folder of ContextCommandFolders )
{
    const ContextCommandsPath = path.join(ContextFoldersPath, Folder);
    const ContextCommandFiles = fs.readdirSync(ContextCommandsPath).filter(file => file.endsWith(".js"));
    
    for ( const File of ContextCommandFiles )
    {
        const FilePath = path.join(ContextCommandsPath, File);
        const TempCommand = require(FilePath);
        if ( 'execute' in TempCommand && 'registerData' in TempCommand ) { Collections.ContextCommands.set(TempCommand.Name, TempCommand); }
        else { console.warn(`[WARNING] The Context Command at ${FilePath} is missing required "execute" or "registerData" methods.`); }
    }
}

// Buttons
const ButtonFoldersPath = path.join(__dirname, 'Interactions/Buttons');
const ButtonFolders = fs.readdirSync(ButtonFoldersPath);

for ( const Folder of ButtonFolders )
{
    const ButtonPath = path.join(ButtonFoldersPath, Folder);
    const ButtonFiles = fs.readdirSync(ButtonPath).filter(file => file.endsWith(".js"));
    
    for ( const File of ButtonFiles )
    {
        const FilePath = path.join(ButtonPath, File);
        const TempFile = require(FilePath);
        if ( 'execute' in TempFile ) { Collections.Buttons.set(TempFile.Name, TempFile); }
        else { console.warn(`[WARNING] The Button at ${FilePath} is missing required "execute" method.`); }
    }
}

// Selects
const SelectFoldersPath = path.join(__dirname, 'Interactions/Selects');
const SelectFolders = fs.readdirSync(SelectFoldersPath);

for ( const Folder of SelectFolders )
{
    const SelectPath = path.join(SelectFoldersPath, Folder);
    const SelectFiles = fs.readdirSync(SelectPath).filter(file => file.endsWith(".js"));
    
    for ( const File of SelectFiles )
    {
        const FilePath = path.join(SelectPath, File);
        const TempFile = require(FilePath);
        if ( 'execute' in TempFile ) { Collections.Selects.set(TempFile.Name, TempFile); }
        else { console.warn(`[WARNING] The Select at ${FilePath} is missing required "execute" method.`); }
    }
}

// Modals
const ModalFoldersPath = path.join(__dirname, 'Interactions/Modals');
const ModalFolders = fs.readdirSync(ModalFoldersPath);

for ( const Folder of ModalFolders )
{
    const ModalPath = path.join(ModalFoldersPath, Folder);
    const ModalFiles = fs.readdirSync(ModalPath).filter(file => file.endsWith(".js"));
    
    for ( const File of ModalFiles )
    {
        const FilePath = path.join(ModalPath, File);
        const TempFile = require(FilePath);
        if ( 'execute' in TempFile ) { Collections.Modals.set(TempFile.Name, TempFile); }
        else { console.warn(`[WARNING] The Modal at ${FilePath} is missing required "execute" method.`); }
    }
}








/******************************************************************************* */
// DISCORD - READY EVENT
DiscordClient.once('ready', async () => {
    DiscordClient.user.setPresence({ status: 'online' });

    // Restart Timers
    await restartTimersOnStartup();

    console.log(`${checkPomelo(DiscordClient.user) ? `${DiscordClient.user.username}` : `${DiscordClient.user.username}#${DiscordClient.user.discriminator}`} is online and ready!`);
    return;
});








/******************************************************************************* */
// DEBUGGING AND ERROR LOGGING
// Warnings
process.on('warning', async (warning) => { await LogWarn(null, warning); return; });
DiscordClient.on('warn', async (warning) => { await LogWarn(null, warning); return; });

// Unhandled Promise Rejections
process.on('unhandledRejection', async (err) => { await LogError(err); return; });

// Discord Errors
DiscordClient.on('error', async (err) => { await LogError(err); return; });

// Discord Rate Limit - Only uncomment when debugging
//DiscordClient.rest.on('rateLimited', (RateLimitError) => { console.log("***DISCORD RATELIMIT HIT: ", RateLimitError); return; });

// Mongoose Errors
Mongoose.connection.on('error', async err => { await LogError(err); });








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
        // No Command detected, thus standard Message

        // Ignore if in Home Channel
        if ( await GuildConfig.exists({ homeChannelId: message.channelId }) != null ) { return; }

        
        // If a direct reply, check for highlighting! (if enabled)
        let homeConfig = await GuildConfig.findOne({ guildId: message.guildId });

        if ( homeConfig?.highlightMessages === true && message.type === MessageType.Reply )
        {
            await processMessageReply(message);
        }


        // If sent in Public Thread Channel check for highlighting! (if enabled)
        if ( homeConfig?.highlightThreads === true && (message.channel.type === ChannelType.PublicThread || message.channel.type === ChannelType.AnnouncementThread) )
        {
            //.
        }

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
        await LogInfo(`****Unrecognised or new unhandled Interaction type triggered:\n${interaction.type}\n${interaction}`);
        return;
    }
});






// Needed for the next set of Events
const { removeGuild, removeMessage } = require("./BotModules/DatabaseModule.js");
const { GuildConfig, GuildBlocklist, FeaturedChannel, FeaturedThread } = require("./Mongoose/Models.js");
const { resetHome, resetHomeSliently } = require("./BotModules/HomeModule.js");
const { processMessageReply, processMessageReaction } = require("./BotModules/Events/MessageEvents.js");

/******************************************************************************* */
// DISCORD - GUILD DELETE EVENT

DiscordClient.on('guildDelete', async (guild) => {
    
    // Purge all data relating to that Guild
    await removeGuild(guild.id);

    return;
});








/******************************************************************************* */
// DISCORD - MESSAGE DELETE EVENT

DiscordClient.on('messageDelete', async (message) => {

    // Ignore any other messages that have NOT been sent under HomeCord's Webhook(s)
    if ( message.webhookId == null ) { return; }

    // Check if Message is needed for core function of Home Channel
    let isMessageNeeded = await GuildConfig.exists({ $or: [ { headerMessageId: message.id }, { eventThreadsMessageId: message.id }, { audioMessageId: message.id } ] });

    // Deleted Message is needed - reset Home & post message in Home Channel stating so
    if ( isMessageNeeded != null ) { resetHome(message.guildId); }
    // Deleted Message is not needed for core function of Home Channel, thus treat it as featured message and delete from DB
    else { await removeMessage(message.id); }

    return;
});








/******************************************************************************* */
// DISCORD - CHANNEL DELETE EVENT

DiscordClient.on('channelDelete', async (oldChannel) => {
    
    // Ignore DMs
    if ( oldChannel instanceof DMChannel ) { return; }


    // Check against Block List
    if ( await GuildBlocklist.exists({ blockedId: oldChannel.id, guildId: oldChannel.guildId }) != null ) { await GuildBlocklist.deleteMany({ blockedId: oldChannel.id, guildId: oldChannel.guildId }); return; }

    // Check against Featured Channels
    if ( await FeaturedChannel.exists({ channelId: oldChannel.id, guildId: oldChannel.guildId }) != null ) { await FeaturedChannel.deleteMany({ channelId: oldChannel.id, guildId: oldChannel.guildId }); return; }

    // Check against Featured Threads
    if ( await FeaturedThread.exists({ threadId: oldChannel.id, guildId: oldChannel.guildId }) != null ) { await FeaturedThread.deleteMany({ threadId: oldChannel.id, guildId: oldChannel.guildId }); return; }

    // Check if Home Channel was deleted
    if ( await GuildConfig.exists({ homeChannelId: oldChannel.id, guildId: oldChannel.guildId }) != null ) { await resetHomeSliently(oldChannel.guildId); return; }

    return;

});








/******************************************************************************* */
// DISCORD - MESSAGE REACTION ADD EVENT

DiscordClient.on('messageReactionAdd', async (reaction, user) => {

    // Just in case, ignore DMs
    if ( reaction.message?.channel?.type === ChannelType.DM ) { return; }

    // Catch for partials
    if ( reaction.partial ) { await reaction.fetch(); }

    // Ignore if in Home Channel
    if ( await GuildConfig.exists({ homeChannelId: reaction.message.channelId }) != null ) { return; }

    // Check for highlighting! (if enabled)
    let guildConfig = await GuildConfig.findOne({ guildId: reaction.message.guildId });

    if ( guildConfig?.highlightMessages === true )
    {
        await processMessageReaction(reaction, user);
    }

    return;

});








/******************************************************************************* */

DiscordClient.login(Config.TOKEN).catch(console.error); // Login to and start the Discord Bot Client
Mongoose.connect(Config.MongoString).catch(console.error);
