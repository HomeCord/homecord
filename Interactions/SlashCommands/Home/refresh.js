const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits } = require("discord.js");
const { GuildConfig } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");
const { refreshHeader, refreshEventsThreads, refreshMessagesAudio } = require("../../../BotModules/HomeModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "refresh",

    // Command's Description
    Description: `Force refresh this Server's Home Channel`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Force refresh this Server's Home Channel`,
        'en-US': `Force refresh this Server's Home Channel`
    },

    // Command's Category
    Category: "HOME",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 6.048e+8, // 7 days

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
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        // Just in case
        await interaction.deferReply({ ephemeral: true });

        // Ensure Server actually has a Home Channel setup
        if ( await GuildConfig.exists({ guildId: guildId }) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_HOME_NOT_SETUP') }); return; }


        // *******
        // FIRST - refresh Header
        let headerResponse = await refreshHeader(interaction.guildId, interaction.guildLocale, interaction.guild.name, interaction.guild.description);

        if ( headerResponse === "GUILD_OUTAGE" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_GUILD_OUTAGE') }); return; }
        else if ( headerResponse === "WEBHOOK_MISSING" || headerResponse === "WEBHOOK_NOT_FETCHED" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_MISSING_WEBHOOK') }); return; }


        // *******
        // SECOND - refresh Events & Threads section
        let eventThreadResponse = await refreshEventsThreads(interaction.guildId, interaction.guildLocale);

        if ( eventThreadResponse === "GUILD_OUTAGE" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_GUILD_OUTAGE') }); return; }
        else if ( eventThreadResponse === "WEBHOOK_MISSING" || headerResponse === "WEBHOOK_NOT_FETCHED" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_MISSING_WEBHOOK') }); return; }


        // *******
        // THIRD - refresh Messages & Audio section
        let messageAudioResponse = await refreshMessagesAudio(interaction.guildId, interaction.guildLocale);

        if ( messageAudioResponse === "GUILD_OUTAGE" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_GUILD_OUTAGE') }); return; }
        else if ( messageAudioResponse === "WEBHOOK_MISSING" || headerResponse === "WEBHOOK_NOT_FETCHED" ) { await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_ERROR_MISSING_WEBHOOK') }); return; }


        // *******
        // SUCCESSFUL - ACK
        await interaction.editReply({ content: localize(interaction.locale, 'REFRESH_COMMAND_SUCCESS') });

        return;
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction)
    {
        //.
    }
}
