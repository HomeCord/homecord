const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType,ApplicationCommandOptionChoiceData, Collection, GuildScheduledEvent } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");

// To ensure not hitting 3 second limit on autocomplete response timings
/** @type {Collection<String, Collection<String, GuildScheduledEvent>>} */
const EventCache = new Collection();

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "feature",

    // Command's Description
    Description: `Feature a Channel, Event, or Thread to your Home Channel`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Feature a Channel, Event, or Thread to your Home Channel`,
        'en-US': `Feature a Channel, Event, or Thread to your Home Channel`
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
                description: "Feature a Thread or Forum Post on your Home Channel",
                descriptionLocalizations: {
                    'en-GB': "Feature a Thread or Forum Post on your Home Channel",
                    'en-US': "Feature a Thread or Forum Post on your Home Channel"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "thread",
                        description: "Thread or Forum Post to feature",
                        descriptionLocalizations: {
                            'en-GB': "Thread or Forum Post to feature",
                            'en-US': "Thread or Forum Post to feature"
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
                        channelTypes: [ ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement ],
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
        //.
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
