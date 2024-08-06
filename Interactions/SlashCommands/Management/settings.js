const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { GuildConfig } = require("../../../Mongoose/Models.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "settings",

    // Command's Description
    Description: `View or change HomeCord's Settings for your Server's Home Channel`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `View or change HomeCord's Settings for your Server's Home Channel`,
        'en-US': `View or change HomeCord's Settings for your Server's Home Channel`
    },

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "example": 3
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "example": "GUILD"
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
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;
        Data.options = [
            {
                name: `view`,
                description: `View HomeCord's current settings for this Server`,
                descriptionLocalizations: {
                    'en-GB': `View HomeCord's current settings for this Server`,
                    'en-US': `View HomeCord's current settings for this Server`,
                },
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `edit`,
                description: `Edit HomeCord's settings for this Server`,
                descriptionLocalizations: {
                    'en-GB': `Edit HomeCord's settings for this Server`,
                    'en-US': `Edit HomeCord's settings for this Server`,
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: `message_activity`,
                        description: `Set or disable the Activity Threshold for highlighting Messages`,
                        descriptionLocalizations: {
                            'en-GB': `Set or disable the Activity Threshold for highlighting Messages`,
                            'en-US': `Set or disable the Activity Threshold for highlighting Messages`,
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: `Disable Highlighting Messages`, value: `DISABLED` },
                            { name: `Very Low`, value: `VERY_LOW` },
                            { name: `Low`, value: `LOW` },
                            { name: `Medium`, value: `MEDIUM` },
                            { name: `High`, value: `HIGH` }
                            //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                        ],
                        required: false
                    },
                    {
                        name: `event_activity`,
                        description: `Set or disable the Activity Threshold for highlighting Scheduled Events`,
                        descriptionLocalizations: {
                            'en-GB': `Set or disable the Activity Threshold for highlighting Scheduled Events`,
                            'en-US': `Set or disable the Activity Threshold for highlighting Scheduled Events`,
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: `Disable Highlighting Events`, value: `DISABLED` },
                            { name: `Very Low`, value: `VERY_LOW` },
                            { name: `Low`, value: `LOW` },
                            { name: `Medium`, value: `MEDIUM` },
                            { name: `High`, value: `HIGH` }
                            //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                        ],
                        required: false
                    },
                    /* {
                        name: `voice_activity`,
                        description: `Set or disable the Activity Threshold for highlighting Voice Channels`,
                        descriptionLocalizations: {
                            'en-GB': `Set or disable the Activity Threshold for highlighting Voice Channels`,
                            'en-US': `Set or disable the Activity Threshold for highlighting Voice Channels`,
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: `Disable Highlighting Voice`, value: `DISABLED` },
                            { name: `Very Low`, value: `VERY_LOW` },
                            { name: `Low`, value: `LOW` },
                            { name: `Medium`, value: `MEDIUM` },
                            { name: `High`, value: `HIGH` }
                            //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                        ],
                        required: false
                    },
                    {
                        name: `stage_activity`,
                        description: `Set or disable the Activity Threshold for highlighting live Stages`,
                        descriptionLocalizations: {
                            'en-GB': `Set or disable the Activity Threshold for highlighting live Stages`,
                            'en-US': `Set or disable the Activity Threshold for highlighting live Stages`,
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: `Disable Highlighting Stages`, value: `DISABLED` },
                            { name: `Very Low`, value: `VERY_LOW` },
                            { name: `Low`, value: `LOW` },
                            { name: `Medium`, value: `MEDIUM` },
                            { name: `High`, value: `HIGH` }
                            //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                        ],
                        required: false
                    }, */
                    {
                        name: `thread_activity`,
                        description: `Set or disable the Activity Threshold for highlighting Threads & Forum Posts`,
                        descriptionLocalizations: {
                            'en-GB': `Set or disable the Activity Threshold for highlighting Threads & Forum Posts`,
                            'en-US': `Set or disable the Activity Threshold for highlighting Threads & Forum Posts`,
                        },
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: `Disable Highlighting Threads & Posts`, value: `DISABLED` },
                            { name: `Very Low`, value: `VERY_LOW` },
                            { name: `Low`, value: `LOW` },
                            { name: `Medium`, value: `MEDIUM` },
                            { name: `High`, value: `HIGH` }
                            //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                        ],
                        required: false
                    },
                    {
                        name: `allow_star_reactions`,
                        description: `Allow ⭐ Star Reactions to count towards automatically highlighting Messages`,
                        descriptionLocalizations: {
                            'en-GB': `Allow ⭐ Star Reactions to count towards automatically highlighting Messages`,
                            'en-US': `Allow ⭐ Star Reactions to count towards automatically highlighting Messages`,
                        },
                        type: ApplicationCommandOptionType.Boolean,
                        required: false
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
        let homeCordCommands = await DiscordClient.application.commands.fetch();

        // Ensure Server actually has a Home Channel setup
        if ( await GuildConfig.exists({ guildId: interaction.guildId }) == null )
        {
            let setupCommand = homeCordCommands.find(command => command.name === "setup");
            await interaction.reply({ ephemeral: true, content: localize(interaction.locale, 'SETTINGS_COMMAND_ERROR_HOME_NOT_SETUP', setupCommand != undefined ? `</setup:${setupCommand.id}>` : '`/setup`') });
            return;
        }

        // Fetch used Subcommand. If "edit" was used but no options included, send error message
        const SubcommandUsed = interaction.options.getSubcommand(true);

        if ( SubcommandUsed === "view" ) { await viewSettings(interaction); }
        else if ( SubcommandUsed === "edit" && interaction.options.data.length <= 1 ) { await interaction.reply({ ephemeral: true, content: localize(interaction.locale, 'SETTINGS_COMMAND_ERROR_EDIT_NO_OPTIONS_INCLUDED') }); }
        else { await editSettings(interaction); }

        return;
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} autocompleteInteraction 
     */
    async autocomplete(autocompleteInteraction)
    {
        //.
    }
}









/**
 * Shows the current settings for that Server's Home Channel
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function viewSettings(interaction)
{
    await interaction.deferReply({ ephemeral: true });

    // Fetch Settings (and Settings Command for mentionable)
    let serverConfig = await GuildConfig.findOne({ guildId: interaction.guildId });

    // Put into Embed
    let thresholdString = `- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_MESSAGES')} ${localize(interaction.locale, serverConfig.messageActivity)}
- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_EVENTS')} ${localize(interaction.locale, serverConfig.eventActivity)}
- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_THREADS')} ${localize(interaction.locale, serverConfig.threadActivity)}`;

    let settingsEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETTINGS_VIEW_EMBED_TITLE', interaction.guild.name))
    .setDescription(localize(interaction.locale, 'SETTINGS_VIEW_EMBED_DESCRIPTION', `</settings:${interaction.commandId}>`))
    .addFields(
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_HOME_CHANNEL'), value: `<#${serverConfig.homeChannelId}>` },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_ACTIVITY_THRESHOLD'), value: thresholdString },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_STAR_REACTIONS'), value: localize(interaction.locale, serverConfig.allowStarReactions === true ? 'TRUE' : 'FALSE') }
    );

    // ACK
    await interaction.editReply({ embeds: [settingsEmbed] });
    return;
}









/**
 * Edits the given setting values for that Server's Home Channel
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function editSettings(interaction)
{
    await interaction.deferReply({ ephemeral: true });

    // Fetch all the options
    let messagesOption = interaction.options.getString("message_activity");
    let eventsOption = interaction.options.getString("event_activity");
    //let voiceOption = interaction.options.getString("voice_activity");
    //let stageOption = interaction.options.getString("stage_activity");
    let threadsOption = interaction.options.getString("thread_activity");
    let starReactionsOption = interaction.options.getBoolean("allow_star_reactions");

    // Fetch current config
    let serverConfig = await GuildConfig.findOne({ guildId: interaction.guildId });

    // Create Embed
    let updateEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETTINGS_EDIT_EMBED_TITLE', interaction.guild.name))
    .setDescription(localize(interaction.locale, 'SETTINGS_EDIT_EMBED_DESCRIPTION', `</settings:${interaction.commandId}>`));


    // Now go through them, changing their values & adding to Embed
    serverConfig.isNew = false;
    let changedThresholds = "";

    if ( messagesOption != null )
    {
        serverConfig.messageActivity = messagesOption;
        changedThresholds += `- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_MESSAGES')} ${localize(interaction.locale, messagesOption)}`;
    }

    if ( eventsOption != null )
    {
        serverConfig.eventActivity = eventsOption;
        changedThresholds += `${changedThresholds.length > 2 ? `\n` : ""}- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_EVENTS')} ${localize(interaction.locale, eventsOption)}`;
    }

    /* if ( voiceOption != null )
    {
        serverConfig.voiceActivity = voiceOption;
        changedThresholds += `${changedThresholds.length > 2 ? `\n` : ""}- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_VOICE')} ${localize(interaction.locale, voiceOption)}`;
    }

    if ( stageOption != null )
    {
        serverConfig.stageActivity = stageOption;
        changedThresholds += `${changedThresholds.length > 2 ? `\n` : ""}- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_STAGES')} ${localize(interaction.locale, stageOption)}`;
    } */

    if ( threadsOption != null )
    {
        serverConfig.threadActivity = threadsOption;
        changedThresholds += `${changedThresholds.length > 2 ? `\n` : ""}- ${localize(interaction.locale, 'SETTINGS_VIEW_EMBED_THREADS')} ${localize(interaction.locale, threadsOption)}`;
    }

    updateEmbed.addFields({ name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_ACTIVITY_THRESHOLD'), value: changedThresholds });

    if ( starReactionsOption != null )
    {
        serverConfig.allowStarReactions = starReactionsOption;
        updateEmbed.addFields({ name: localize(interaction.locale, 'SETTINGS_EDIT_EMBED_STAR_REACTIONS'), value: localize(interaction.locale, starReactionsOption === true ? 'TRUE' : 'FALSE') });
    }


    // Save to DB
    await serverConfig.save();


    // ACK
    await interaction.editReply({ embeds: [updateEmbed] });
    return;
}
