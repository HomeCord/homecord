const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType,ApplicationCommandOptionChoiceData, Collection, GuildScheduledEvent } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");
const { GuildConfig, FeaturedEvent, TimerModel, FeaturedChannel, FeaturedThread, GuildBlocklist } = require("../../../Mongoose/Models.js");
const { calculateIsoTimeUntil, calculateUnixTimeUntil, calculateTimeoutDuration } = require("../../../BotModules/UtilityModule.js");
const { LogError } = require("../../../BotModules/LoggingModule.js");
const { refreshEventsThreads, refreshHeader } = require("../../../BotModules/HomeModule.js");
const { expireEvent, expireThread } = require("../../../BotModules/ExpiryModule.js");

// To ensure not hitting 3 second limit on autocomplete response timings
/** @type {Collection<String, Collection<String, GuildScheduledEvent>>} */
const EventCache = new Collection();

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "feature",

    // Command's Description
    Description: `Feature a Channel, Event, or Thread/Post to your Home Channel`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Feature a Channel, Event, or Thread/Post to your Home Channel`,
        'en-US': `Feature a Channel, Event, or Thread/Post to your Home Channel`
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
                description: "Feature a Scheduled Event on your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Feature a Scheduled Event on your Home Channel",
                    'en-US': "Feature a Scheduled Event on your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "event",
                        description: "Event to feature",
                        descriptionLocalizations: {
                            'en-GB': "Event to feature",
                            'en-US': "Event to feature"
                        },
                        required: true,
                        autocomplete: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "duration",
                        description: "How long you want to feature this for",
                        descriptionLocalizations: {
                            'en-GB': "How long you want to feature this for",
                            'en-US': "How long you want to feature this for"
                        },
                        required: true,
                        choices: [
                            { name: "12 Hours", value: "TWELVE_HOURS" },
                            { name: "1 Day", value: "ONE_DAY" },
                            { name: "3 Days", value: "THREE_DAYS" },
                            { name: "7 Days", value: "SEVEN_DAYS" }
                        ]
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "thread",
                description: "Feature a Thread or Forum/Media Post on your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Feature a Thread or Forum/Media Post on your Home Channel",
                    'en-US': "Feature a Thread or Forum/Media Post on your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "thread",
                        description: "Thread or Forum/Media Post to feature",
                        descriptionLocalizations: {
                            'en-GB': "Thread or Forum/Media Post to feature",
                            'en-US': "Thread or Forum/Media Post to feature"
                        },
                        channelTypes: [ ChannelType.PublicThread ],
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "duration",
                        description: "How long you want to feature this for",
                        descriptionLocalizations: {
                            'en-GB': "How long you want to feature this for",
                            'en-US': "How long you want to feature this for"
                        },
                        required: true,
                        choices: [
                            { name: "12 Hours", value: "TWELVE_HOURS" },
                            { name: "1 Day", value: "ONE_DAY" },
                            { name: "3 Days", value: "THREE_DAYS" },
                            { name: "7 Days", value: "SEVEN_DAYS" }
                        ]
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "channel",
                description: "Feature a Channel on your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Feature a Channel on your Home Channel",
                    'en-US': "Feature a Channel on your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "channel",
                        description: "Channel to feature",
                        descriptionLocalizations: {
                            'en-GB': "Channel to feature",
                            'en-US': "Channel to feature"
                        },
                        channelTypes: [ ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement, ChannelType.GuildMedia ],
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "description",
                        description: "Optional description of the Channel to feature",
                        descriptionLocalizations: {
                            'en-GB': "Optional description of the Channel to feature",
                            'en-US': "Optional description of the Channel to feature"
                        },
                        required: false,
                        maxLength: 150
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

            // Ensure we haven't hit the maximum number of Events featured on Home
            let fetchedFeaturedEvents = await FeaturedEvent.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedEvents.length === 5 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_MAX_FEATURED_EVENTS') }); return; }

            // Grab Inputs
            const InputEvent = interaction.options.getString("event", true);
            const InputDuration = interaction.options.getString("duration", true);

            // Validate there was actually an Event inputted
            if ( InputEvent === "EVENTS_NOT_FOUND" ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_NO_EVENTS_FOUND') }); return; }
            // Validate user input is a real Event ID in that Server
            if ( interaction.guild.scheduledEvents.resolve(InputEvent) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Event isn't already being featured
            if ( fetchedFeaturedEvents.find(tempDoc => tempDoc.eventId === InputEvent) != undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_EVENT_ALREADY_FEATURED') }); return; }

            // Add to database
            await FeaturedEvent.create({
                guildId: interaction.guildId,
                eventId: InputEvent,
                featureType: "FEATURE",
                featureUntil: calculateIsoTimeUntil(InputDuration)
            })
            .then(async (newDocument) => {
                await newDocument.save()
                .then(async () => {

                    // Store callback to remove featured Event from Home Channel after duration (just in case)
                    await TimerModel.create({ timerExpires: calculateUnixTimeUntil(InputDuration), callback: expireEvent.toString(), guildId: interaction.guildId, eventId: InputEvent, guildLocale: interaction.guildLocale })
                    .then(async newDocument => { await newDocument.save(); })
                    .catch(async err => { await LogError(err); });

                    // Call method to update Home Channel to reflect newly featured Event!
                    let refreshState = await refreshEventsThreads(interaction.guildId, interaction.guildLocale);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_SUCCESS') }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_GENERIC') }); }

                    // Timeout for auto-removing the Event
                    setTimeout(async () => { await expireEvent(interaction.guildId, InputEvent, interaction.guildLocale) }, calculateTimeoutDuration(InputDuration));
                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_GENERIC') });
                    return;
                })
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_EVENT_ERROR_GENERIC') });
                return;
            });


            return;
        }
        // ******* CHANNELS SUBCOMMAND
        else if ( SubcommandInput === "channel" )
        {
            // Ensure we haven't hit the maximum number of Channels featured on Home
            let fetchedFeaturedChannels = await FeaturedChannel.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedChannels.length === 6 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_MAX_FEATURED_CHANNELS') }); return; }

            // Grab Inputs
            const InputChannel = interaction.options.getChannel("channel", true, [ ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement, ChannelType.GuildMedia ]);
            const InputDescription = interaction.options.getString("description");

            // Validate user input is a real Channel in that Server (Discord's validation will do most of this for me)
            if ( InputChannel == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Channel isn't already being featured
            if ( fetchedFeaturedChannels.find(tempDoc => tempDoc.channelId === InputChannel.id) != undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_CHANNEL_ALREADY_FEATURED') }); return; }

            // Check against Block List
            if ( await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: InputChannel.id }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_CHANNEL_BLOCKED') }); return; }
            if ( InputChannel.parentId != null && await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: InputChannel.parentId }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_CATEGORY_BLOCKED') }); return; }

            // Add to database
            await FeaturedChannel.create({
                guildId: interaction.guildId,
                channelId: InputChannel.id,
                description: InputDescription != null ? InputDescription : undefined
            })
            .then(async (newDocument) => {
                await newDocument.save()
                .then(async () => {

                    // Call method to update Home Channel to reflect newly featured Channel!
                    let refreshState = await refreshHeader(interaction.guildId, interaction.guildLocale, interaction.guild.name, interaction.guild.description);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_SUCCESS', `<#${InputChannel.id}>`) }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) }); }
                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) });
                    return;
                })
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_CHANNEL_ERROR_GENERIC', `<#${InputChannel.id}>`) });
                return;
            });


            return;
        }
        // ******* THREADS SUBCOMMAND
        if ( SubcommandInput === "thread" )
        {
            // Ensure we haven't hit the maximum number of Threads featured on Home
            let fetchedFeaturedThreads = await FeaturedThread.find({ guildId: interaction.guildId });
            if ( fetchedFeaturedThreads.length === 5 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_MAX_FEATURED_THREADS') }); return; }

            // Grab Inputs
            const InputThread = interaction.options.getChannel("thread", true, [ ChannelType.PublicThread ]);
            const InputDuration = interaction.options.getString("duration", true);

            // Validate user input is a real Thread in that Server
            if ( interaction.guild.channels.resolve(InputThread.id) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_INVALID_INPUT') }); return; }

            // Ensure that Thread isn't already being featured
            if ( fetchedFeaturedThreads.find(tempDoc => tempDoc.threadId === InputThread.id) != undefined ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_THREAD_ALREADY_FEATURED') }); return; }

            // Check against Block List
            if ( InputThread.parentId != null && await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: InputThread.parentId }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_CHANNEL_BLOCKED') }); return; }
            if ( InputThread.parent?.parentId != null && await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: InputThread.parent.parentId }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_CATEGORY_BLOCKED') }); return; }

            // Add to database
            await FeaturedThread.create({
                guildId: interaction.guildId,
                threadId: InputThread.id,
                threadType: InputThread.parent.type === ChannelType.GuildAnnouncement || InputThread.parent.type === ChannelType.GuildText ? "THREAD" : "POST",
                featureType: "FEATURE",
                featureUntil: calculateIsoTimeUntil(InputDuration)
            })
            .then(async (newDocument) => {
                await newDocument.save()
                .then(async () => {

                    // Store callback to remove featured Thread from Home Channel after duration (just in case)
                    await TimerModel.create({ timerExpires: calculateUnixTimeUntil(InputDuration), callback: expireThread.toString(), guildId: interaction.guildId, threadId: InputThread.id, guildLocale: interaction.guildLocale })
                    .then(async newDocument => { await newDocument.save(); })
                    .catch(async err => { await LogError(err); });

                    // Call method to update Home Channel to reflect newly featured Thread!
                    let refreshState = await refreshEventsThreads(interaction.guildId, interaction.guildLocale);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_SUCCESS') }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_GENERIC') }); }

                    // Timeout for auto-removing the Thread
                    setTimeout(async () => { await expireThread(interaction.guildId, InputThread.id, interaction.guildLocale) }, calculateTimeoutDuration(InputDuration));
                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_GENERIC') });
                    return;
                })
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_COMMAND_THREAD_ERROR_GENERIC') });
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
