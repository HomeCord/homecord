const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType,ApplicationCommandOptionChoiceData, Collection, GuildScheduledEvent } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");
const { GuildConfig, FeaturedEvent, TimerModel, FeaturedChannel, FeaturedThread } = require("../../../Mongoose/Models.js");
const { LogError } = require("../../../BotModules/LoggingModule.js");
const { refreshEventsThreads, refreshHeader } = require("../../../BotModules/HomeModule.js");

// To ensure not hitting 3 second limit on autocomplete response timings
/** @type {Collection<String, Collection<String, GuildScheduledEvent>>} */
const EventCache = new Collection();

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "unfeature",

    // Command's Description
    Description: `Remove a featured Channel, Event, or Thread/Post from your Home Channel`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Remove a featured Channel, Event, or Thread/Post from your Home Channel`,
        'en-US': `Remove a featured Channel, Event, or Thread/Post from your Home Channel`
    },

    // Command's Category
    Category: "HOME",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 20,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "event": 20,
        "thread": 20,
        "channel": 20
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "event": "GUILD",
        "thread": "GUILD",
        "channel": "GUILD"
    },



    /**
     * Returns data needed for registering Slash Command onto Discord's API
     * @returns {ChatInputApplicationCommandData}
     */
    registerData()
    {
        /** @type {ChatInputApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = this.Description;
        Data.descriptionLocalizations = this.LocalisedDescriptions;
        Data.type = ApplicationCommandType.ChatInput;
        Data.dmPermission = false;
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageChannels;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "event",
                description: "Remove a featured Scheduled Event from your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Remove a featured Scheduled Event from your Home Channel",
                    'en-US': "Remove a featured Scheduled Event from your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "event",
                        description: "Event to remove",
                        descriptionLocalizations: {
                            'en-GB': "Event to remove",
                            'en-US': "Event to remove"
                        },
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "thread",
                description: "Remove a featured Thread or Forum/Media Post from your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Remove a featured Thread or Forum/Media Post from your Home Channel",
                    'en-US': "Remove a featured Thread or Forum/Media Post from your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "thread",
                        description: "Thread or Forum/Media Post to remove",
                        descriptionLocalizations: {
                            'en-GB': "Thread or Forum/Media Post to remove",
                            'en-US': "Thread or Forum/Media Post to remove"
                        },
                        channelTypes: [ ChannelType.PublicThread ],
                        required: true
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "channel",
                description: "Remove a featured Channel from your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Remove a featured Channel from your Home Channel",
                    'en-US': "Remove a featured Channel from your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "channel",
                        description: "Channel to remove",
                        descriptionLocalizations: {
                            'en-GB': "Channel to remove",
                            'en-US': "Channel to remove"
                        },
                        channelTypes: [ ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement, ChannelType.GuildMedia ],
                        required: true
                    }
                ]
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });

        // Ensure Home Channel has been setup
        let fetchedHomeSettings = await GuildConfig.findOne({ guildId: interaction.guildId });
        if ( !fetchedHomeSettings || fetchedHomeSettings == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_HOME_NOT_SETUP', `\`/setup\``) }); return; }

        // Now fetch subcommand used
        const SubcommandInput = interaction.options.getSubcommand(true);


        // ******* EVENTS SUBCOMMAND
        if ( SubcommandInput === "event" )
        {
            // Delete Autocomplete Event Cache now that Command has been submitted
            EventCache.delete(interaction.guildId);

            // Ensure there are actually featured Events
            let fetchedFeaturedEvents = await FeaturedEvent.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedEvents.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_NO_FEATURED_EVENTS') }); return; }

            // Grab Inputs
            const InputEvent = interaction.options.getString("event", true);

            // Validate there was actually an Event inputted
            if ( InputEvent === "EVENTS_NOT_FOUND" ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_NO_EVENTS_FOUND') }); return; }
            // Validate user input is a real Event ID in that Server
            if ( interaction.guild.scheduledEvents.resolve(InputEvent) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Event is being featured
            if ( fetchedFeaturedEvents.find(tempDoc => tempDoc.eventId === InputEvent) == undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_EVENT_NOT_FEATURED') }); return; }

            // Remove from database
            await FeaturedEvent.deleteOne({
                guildId: interaction.guildId,
                eventId: InputEvent
            })
            .then(async (oldDocument) => {
                try {

                    // Call method to update Home Channel to reflect removed featured Event
                    let refreshState = await refreshEventsThreads(interaction.guildId, interaction.guildLocale);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_SUCCESS') }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_GENERIC') }); }

                    return;

                }
                catch (err) {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_GENERIC') });
                    return;
                }
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_EVENT_ERROR_GENERIC') });
                return;
            });


            return;
        }
        // ******* CHANNELS SUBCOMMAND
        else if ( SubcommandInput === "channel" )
        {
            // Ensure there are actually featured Channels
            let fetchedFeaturedChannels = await FeaturedChannel.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedChannels.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_NO_FEATURED_CHANNELS') }); return; }

            // Grab Inputs
            const InputChannel = interaction.options.getChannel("channel", true, [ ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement, ChannelType.GuildMedia ]);

            // Validate user input is a real Channel in that Server (Discord's validation will do most of this for me)
            if ( InputChannel == null ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Channel is being featured
            if ( fetchedFeaturedChannels.find(tempDoc => tempDoc.channelId === InputChannel.id) == undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_CHANNEL_NOT_FEATURED') }); return; }

            // Remove from database
            await FeaturedChannel.deleteOne({
                guildId: interaction.guildId,
                channelId: InputChannel.id
            })
            .then(async (oldDocument) => {
                try {

                    // Call method to update Home Channel to reflect removed featured Channel
                    let refreshState = await refreshHeader(interaction.guildId, interaction.guildLocale, interaction.guild.name, interaction.guild.description);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_SUCCESS', `<#${InputChannel.id}>`) }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) }); }
                    return;

                }
                catch (err) {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) });
                    return;
                }
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) });
                return;
            });


            return;
        }
        // ******* THREADS SUBCOMMAND
        if ( SubcommandInput === "thread" )
        {
            // Ensure there are actually featured Threads
            let fetchedFeaturedThreads = await FeaturedThread.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedThreads.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_NO_FEATURED_THREADS') }); return; }

            // Grab Inputs
            const InputThread = interaction.options.getChannel("thread", true, [ ChannelType.PublicThread ]);

            // Validate user input is a real Thread in that Server
            if ( interaction.guild.channels.resolve(InputThread.id) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Thread is being featured
            if ( fetchedFeaturedThreads.find(tempDoc => tempDoc.threadId === InputThread.id) == undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_THREAD_NOT_FEATURED') }); return; }

            // Remove from database
            await FeaturedThread.deleteOne({
                guildId: interaction.guildId,
                threadId: InputThread.id
            })
            .then(async (oldDocument) => {
                try {
                    // Call method to update Home Channel to reflect removed featured Thread
                    let refreshState = await refreshEventsThreads(interaction.guildId, interaction.guildLocale);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_SUCCESS') }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_GENERIC') }); }

                    return;

                }
                catch (err) {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_GENERIC') });
                    return;
                }
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_COMMAND_THREAD_ERROR_GENERIC') });
                return;
            });


            return;
        }
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction)
    {
        // Since the only autocomplete subcommand is for finding Scheduled Events, I'm gonna be lazy and not add a check here for which subcommand is calling this method lol

        // Fetch Server's Events
        let serverEvents = null;
        let cachedEvents = EventCache.get(interaction.guildId);
        if ( !cachedEvents ) { serverEvents = await interaction.guild.scheduledEvents.fetch(); }
        else { serverEvents = cachedEvents; }

        // Grab focused value
        const FocusedValue = interaction.options.getFocused().trim();


        // Check there are actually Scheduled Events listed
        if ( serverEvents.size < 1 )
        {
            await interaction.respond([{ name: localize(interaction.locale, 'FEATURE_COMMAND_AUTOCOMPLETE_NO_EVENTS_FOUND'), value: "EVENTS_NOT_FOUND" }]);
        }
        // If no input, default to first 25 Events
        else if ( !FocusedValue || FocusedValue == "" )
        {
            // Construct an array from the Collection, taking into account 25 limit for autocomplete responses
            /** @type {ApplicationCommandOptionChoiceData<String>[]} */
            let responseArray = [];

            serverEvents.forEach(event => {
                if ( responseArray.length < 25 ) { responseArray.push({ name: event.name, value: event.id }); }
            });

            await interaction.respond(responseArray);
        }
        // Yes input, so filter based off Event Names
        else
        {
            /** @type {ApplicationCommandOptionChoiceData<String>[]} */
            let responseArrayFiltered = [];

            // Filter events
            serverEvents = serverEvents.filter(tempEvent => {
                let returnValue = false;

                if ( tempEvent.name.toLowerCase().includes(FocusedValue.toLowerCase()) ) { returnValue = true; }
                if ( tempEvent.name.toLowerCase().startsWith(FocusedValue.toLowerCase()) ) { returnValue = true; }
                // Just to support use of Event IDs as input, in case of power users lol
                if ( tempEvent.id === FocusedValue ) { returnValue = true; }

                return returnValue;
            });

            // Sort into respondable array
            serverEvents.forEach(tempEvent => {
                responseArrayFiltered.push({ name: tempEvent.name, value: tempEvent.id });
            });

            await interaction.respond(responseArrayFiltered);
        }


        // Cache Events for reducing response times
        EventCache.set(interaction.guildId, serverEvents);

        return;
    }
}
