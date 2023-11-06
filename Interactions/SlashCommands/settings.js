const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { GuildConfig } = require("../../Mongoose/Models.js");
const { localize } = require("../../BotModules/LocalizationModule.js");

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
    Cooldown: 60,

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
                name: `activity_threshold`,
                description: `Change the Activity Threshold for your Home Channel`,
                descriptionLocalizations: {
                    'en-GB': `Change the Activity Threshold for your Home Channel`,
                    'en-US': `Change the Activity Threshold for your Home Channel`
                },
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: `Very Low`, value: `VERY_LOW` },
                    { name: `Low`, value: `LOW` },
                    { name: `Medium`, value: `MEDIUM` },
                    { name: `High`, value: `HIGH` }
                    //{ name: `Very High`, value: `VERY_HIGH` } // Intentionally commented out for now
                ],
                required: false
            },
            {
                name: `highlight_messages`,
                description: `Set if Messages can be highlighted or not`,
                descriptionLocalizations: {
                    'en-GB': `Set if Messages can be highlighted or not`,
                    'en-US': `Set if Messages can be highlighted or not`,
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: `highlight_events`,
                description: `Set if Scheduled Events can be highlighted or not`,
                descriptionLocalizations: {
                    'en-GB': `Set if Scheduled Events can be highlighted or not`,
                    'en-US': `Set if Scheduled Events can be highlighted or not`,
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: `highlight_voice`,
                description: `Set if active Voice Channels can be highlighted or not`,
                descriptionLocalizations: {
                    'en-GB': `Set if active Voice Channels can be highlighted or not`,
                    'en-US': `Set if active Voice Channels can be highlighted or not`,
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: `highlight_stages`,
                description: `Set if live Stages can be highlighted or not`,
                descriptionLocalizations: {
                    'en-GB': `Set if live Stages can be highlighted or not`,
                    'en-US': `Set if live Stages can be highlighted or not`,
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: `highlight_threads`,
                description: `Set if Threads and Forum Posts can be highlighted or not`,
                descriptionLocalizations: {
                    'en-GB': `Set if Threads and Forum Posts can be highlighted or not`,
                    'en-US': `Set if Threads and Forum Posts can be highlighted or not`,
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} slashCommand 
     */
    async execute(slashCommand)
    {
        let homeCordCommands = await DiscordClient.application.commands.fetch();

        // Ensure Server actually has a Home Channel setup
        if ( await GuildConfig.exists({ guildId: slashCommand.guildId }) == null )
        {
            let setupCommand = homeCordCommands.find(command => command.name === "setup");
            await slashCommand.reply({ ephemeral: true, content: localize(slashCommand.locale, 'SETTINGS_COMMAND_ERROR_HOME_NOT_SETUP', setupCommand != undefined ? `</setup:${setupCommand.id}>` : '`/setup`') });
            return;
        }


        // If no options provided, default to "View Settings" - otherwise, edit the given Setting values
        if ( slashCommand.options.data.length === 0 ) { await viewSettings(slashCommand); }
        else { await editSettings(slashCommand); }

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
    let homeCordCommands = await DiscordClient.application.commands.fetch();
    let settingCommand = homeCordCommands.find(command => command.name === "settings");

    // Put into Embed
    let settingsEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETTINGS_VIEW_EMBED_TITLE', interaction.guild.name))
    .setDescription(localize(interaction.locale, 'SETTINGS_VIEW_EMBED_DESCRIPTION', settingCommand != undefined ? `</settings:${settingCommand.id}>` : '`/settings`'))
    .addFields(
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_HOME_CHANNEL'), value: `<#${serverConfig.homeChannelId}>` },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_ACTIVITY_THRESHOLD'), value: localize(interaction.locale, serverConfig.activityThreshold === "VERY_LOW" ? 'VERY_LOW' : serverConfig.activityThreshold === "LOW" ? 'LOW' : serverConfig.activityThreshold === "MEDIUM" ? 'MEDIUM' : serverConfig.activityThreshold === "HIGH" ? 'HIGH' : 'VERY_HIGH') },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_MESSAGES'), value: localize(interaction.locale, serverConfig.highlightMessages ? 'TRUE' : 'FALSE') },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_EVENTS'), value: localize(interaction.locale, serverConfig.highlightEvents ? 'TRUE' : 'FALSE') },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_VOICE'), value: localize(interaction.locale, serverConfig.highlightVoice ? 'TRUE' : 'FALSE') },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_STAGES'), value: localize(interaction.locale, serverConfig.highlightStages ? 'TRUE' : 'FALSE') },
        { name: localize(interaction.locale, 'SETTINGS_VIEW_EMBED_THREADS'), value: localize(interaction.locale, serverConfig.highlightThreads ? 'TRUE' : 'FALSE') }
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
    //.
    await interaction.reply({ ephemeral: true, content: `*Editing settings has not yet been implemented.*` });
    return;
}
