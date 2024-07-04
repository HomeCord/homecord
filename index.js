const { RateLimitError, DMChannel, PartialGroupDMChannel, MessageType, ChannelType, Message } = require("discord.js");
const Mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");
const { DiscordClient, Collections, checkPomelo } = require("./constants.js");
const Config = require("./config.js");

const TextCommandHandler = require("./BotModules/Handlers/TextCommandHandler.js");
const SlashCommandHandler = require("./BotModules/Handlers/SlashCommandHandler.js");
const ContextCommandHandler = require("./BotModules/Handlers/ContextCommandHandler.js");
const ButtonHandler = require("./BotModules/Handlers/ButtonHandler.js");
const SelectHandler = require("./BotModules/Handlers/SelectHandler.js");
const AutocompleteHandler = require("./BotModules/Handlers/AutocompleteHandler.js");
const ModalHandler = require("./BotModules/Handlers/ModalHandler.js");

const { LogWarn, LogError, LogInfo } = require("./BotModules/LoggingModule.js");
const { restartTimersOnStartup } = require("./BotModules/TimerModule.js");
const { processMessageReply, processMessageReaction, processMessageInThread } = require("./BotModules/Events/MessageEvents.js");
const { removeGuild } = require("./BotModules/DatabaseModule.js");
const { GuildConfig, GuildBlocklist, FeaturedChannel, FeaturedThread, FeaturedEvent } = require("./Mongoose/Models.js");

const { refreshEventsThreads, refreshHeader } = require("./BotModules/HomeModule.js");
const { resetHome, resetHomeSliently } = require("./BotModules/ResetHomeModule.js");
const { removeMessage, bulkRemoveMessages } = require("./BotModules/Events/RemoveEvents.js");
const { processGuildEventUserAdd, processGuildEventUpdate } = require("./BotModules/Events/GuildEventEvents.js");



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

DiscordClient.on('messageCreate', async (message) => {

    // Bots
    if ( message.author.bot ) { return; }

    // System Messages
    if ( message.system || message.author.system ) { return; }

    // DM Channel Messages
    if ( message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM ) { return; }

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

        if ( homeConfig?.messageActivity !== "DISABLED" && message.type === MessageType.Reply )
        {
            await processMessageReply(message);
        }


        // If sent in Public Thread Channel check for highlighting! (if enabled)
        if ( homeConfig?.threadActivity !== "DISABLED" && (message.channel.type === ChannelType.PublicThread || message.channel.type === ChannelType.AnnouncementThread) )
        {
            await processMessageInThread(message);
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

    // Ignore anything NOT from Home Channel
    if ( await GuildConfig.exists({ homeChannelId: message.channelId }) == null ) { return; }

    // Check if Message is needed for core function of Home Channel
    let isMessageNeeded = await GuildConfig.exists({ $or: [ { headerMessageId: message.id }, { eventThreadsMessageId: message.id }, { audioMessageId: message.id } ] });

    // Deleted Message is needed - reset Home & post message in Home Channel stating so
    if ( isMessageNeeded != null ) { await resetHome(message.guildId); }
    // Deleted Message is not needed for core function of Home Channel, thus treat it as featured message and delete from DB
    else { await removeMessage(message); }

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
    if ( await FeaturedChannel.exists({ channelId: oldChannel.id, guildId: oldChannel.guildId }) != null )
    {
        await FeaturedChannel.deleteMany({ channelId: oldChannel.id, guildId: oldChannel.guildId });
        await refreshHeader(oldChannel.guildId, oldChannel.guild.preferredLocale, oldChannel.guild.name, oldChannel.guild.description);
        return;
    }

    // Check against Featured Threads
    if ( await FeaturedThread.exists({ threadId: oldChannel.id, guildId: oldChannel.guildId }) != null )
    {
        await FeaturedThread.deleteMany({ threadId: oldChannel.id, guildId: oldChannel.guildId });
        await refreshEventsThreads(oldChannel.guildId, oldChannel.guild.preferredLocale);
        return;
    }

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

    // Ignore Unicode Stars for now, depending on Config
    //   Just to prevent being flooded by Starboard Bots
    if ( reaction.emoji.name === "⭐" && guildConfig.allowStarReactions !== true ) { return; }

    if ( guildConfig?.messageActivity !== "DISABLED" )
    {
        await processMessageReaction(reaction, user);
    }

    return;

});








/******************************************************************************* */
// DISCORD - MESSAGE DELETE BULK EVENT

DiscordClient.on('messageDeleteBulk', async (messageCollection, channel) => {

    // Filter out messages NOT sent by a webhook
    messageCollection = messageCollection.filter(message => message.webhookId != null);
    if ( messageCollection.size < 1 ) { return; }

    // Ignore if NOT in Home Channel
    if ( await GuildConfig.exists({ homeChannelId: channel.id }) == null ) { return; }

    // Check if one or more of the messages are needed for core function of Home Channel
    let filterArray = [];
    messageCollection.forEach(message => {
        filterArray.push({ headerMessageId: message.id });
        filterArray.push({ eventThreadsMessageId: message.id });
        filterArray.push({ audioMessageId: message.id });
    });

    // One or more of the deleted message(s) are needed - so reset Home
    if ( await GuildConfig.exists({ $or: filterArray }) != null ) { await resetHome(channel.guildId); }
    // None of the deleted Messages are needed, so pass onto processer
    else { await bulkRemoveMessages(messageCollection, channel); }

    return;

});








/******************************************************************************* */
// DISCORD - ROLE DELETE EVENT

DiscordClient.on('roleDelete', async (oldRole) => {

    // Check Block List
    if ( await GuildBlocklist.exists({ blockedId: oldRole.id, guildId: oldRole.guild.id }) != null ) { await GuildBlocklist.deleteMany({ blockedId: oldRole.id, guildId: oldRole.guild.id }); return; }

    return;

});








/******************************************************************************* */
// DISCORD - GUILD SCHEDULED EVENT DELETE EVENT

DiscordClient.on('guildScheduledEventDelete', async (oldEvent) => {

    // Check against Featured Events
    if ( await FeaturedEvent.exists({ guildId: oldEvent.guildId, eventId: oldEvent.id }) != null )
    {
        await FeaturedEvent.deleteMany({ guildId: oldEvent.guildId, eventId: oldEvent.id });
        await refreshEventsThreads(oldEvent.guildId, oldEvent?.guild?.preferredLocale);
        return;
    }
    
    return;

});








/******************************************************************************* */
// DISCORD - THREAD DELETE EVENT

DiscordClient.on('threadDelete', async (oldThread) => {

    // Check against Featured Threads
    if ( await FeaturedThread.exists({ threadId: oldThread.id, guildId: oldThread.guildId }) != null )
    {
        await FeaturedThread.deleteMany({ threadId: oldThread.id, guildId: oldThread.guildId });
        await refreshEventsThreads(oldThread.guildId, oldThread.guild.preferredLocale);
        return;
    }

    return;

});








/******************************************************************************* */
// DISCORD - GUILD SCHEDULED EVENT USER ADD EVENT

DiscordClient.on('guildScheduledEventUserAdd', async (scheduledEvent, user) => {
    
    // Only run if Scheduled Event highlighting is enabled
    let guildConfig = await GuildConfig.findOne({ guildId: scheduledEvent.guildId });
    if ( guildConfig == null ) { return; }
    
    if ( guildConfig.eventActivity !== "DISABLED" )
    {
        await processGuildEventUserAdd(scheduledEvent, user);
    }

    return;

});








/******************************************************************************* */
// DISCORD - GUILD SCHEDULED EVENT UPDATE EVENT

DiscordClient.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {

    // Throw straight into method
    await processGuildEventUpdate(oldEvent, newEvent);

    return;

});








/******************************************************************************* */

DiscordClient.login(Config.TOKEN).catch(console.error); // Login to and start the Discord Bot Client
Mongoose.connect(Config.MongoString).catch(console.error);
