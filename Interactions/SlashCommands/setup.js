const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { GuildConfig } = require("../../Mongoose/Models.js");
const { localize } = require("../../BotModules/LocalizationModule.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "setup",

    // Command's Description
    Description: `Setup a Home Channel for your Server!`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Setup a Home Channel for your Server!`,
        'en-US': `Setup a Home Channel for your Server!`
    },

    // Command's Category
    Category: "GENERAL",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 600,

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

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} slashCommand 
     */
    async execute(slashCommand)
    {
        // Ensure Server doesn't already have a Home Channel setup
        if ( await GuildConfig.exists({ guildId: slashCommand.guildId }) != null )
        {
            await slashCommand.reply({ ephemeral: true, content: localize(slashCommand.locale, 'SETUP_COMMAND_ERROR_HOME_ALREADY_SETUP') });
            return;
        }


        // ******* Start setup process
        // Display configure menu for Home Setup
        let setupEmbed = new EmbedBuilder().setColor('Grey')
        .setTitle(localize(slashCommand.locale, 'SETUP_EMBED_TITLE'))
        .setDescription(localize(slashCommand.locale, 'SETUP_EMBED_DESCRIPTION'))
        .addFields(
            { name: localize(slashCommand.locale, 'SETUP_EMBED_CHANNEL'), value: localize(slashCommand.locale, 'CREATE_CHANNEL_FOR_ME') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_ACTIVITY_THRESHOLD'), value: localize(slashCommand.locale, 'MEDIUM') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_HIGHLIGHT_MESSAGES'), value: localize(slashCommand.locale, 'TRUE') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_HIGHLIGHT_SCHEDULED_EVENTS'), value: localize(slashCommand.locale, 'TRUE') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_HIGHLIGHT_VOICE_ACTIVITY'), value: localize(slashCommand.locale, 'TRUE') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_HIGHLIGHT_LIVE_STAGES'), value: localize(slashCommand.locale, 'TRUE') },
            { name: localize(slashCommand.locale, 'SETUP_EMBED_HIGHLIGHT_ACTIVE_THREADS'), value: localize(slashCommand.locale, 'TRUE') },
        )
        .setFooter({ text: localize(slashCommand.locale, 'SETUP_EMBED_FOOTER_STEP_ONE') });

        let setupActionRow = new ActionRowBuilder().addComponents(
            // *******  NOTE ABOUT THE CUSTOM ID
            // The bits after "setup-home_" are used to know what the set values are for each setting
            // In order:
            //   - Home Channel location ("c" = create for me; otherwise ID of Channel)
            //   - Activity Threshold ("vl" = very low; "l" = low; "m" = medium; "h" = high; "vh" = very high)
            //   - Highlight Messages, Events, Voice, Stages, Threads (in that order. "t" = true; "f" = false)
            new StringSelectMenuBuilder().setCustomId('setup-home_c_m_t_t_t_t_t').setMaxValues(1).setMinValues(1).setPlaceholder(localize(slashCommand.locale, 'PLEASE_SELECT_AN_OPTION'))
            .addOptions(
                new StringSelectMenuOptionBuilder().setValue('CHANNEL').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_CHANNEL')).setDescription(localize(slashCommand.locale, 'SETUP_EMBED_CHANNEL_DESCRIPTION')).setEmoji(`⚙`),
                new StringSelectMenuOptionBuilder().setValue('ACTIVITY_THRESHOLD').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_ACTIVITY')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD')).setEmoji(`📊`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_MESSAGES').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_MESSAGES')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_TOGGLE_MESSAGES')).setEmoji(`<:ChannelText:997752062500671590>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_EVENTS').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_EVENTS')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_TOGGLE_EVENTS')).setEmoji(`<:ScheduledEvent:1009372447503552514>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_VOICE').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_VOICE')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_TOGGLE_VOICE')).setEmoji(`<:ChannelVoice:997752063612162138>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_STAGES').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_STAGES')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_TOGGLE_STAGES')).setEmoji(`<:ChannelStage:997752061330464818>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_THREADS').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_THREADS')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_TOGGLE_THREADS')).setEmoji(`<:ChannelForum:1029012363048914967>`),
                new StringSelectMenuOptionBuilder().setValue('SAVE_AND_CREATE').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_SAVE_AND_CREATE')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_SAVE')).setEmoji(`✅`),
                new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(slashCommand.locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(slashCommand.locale, 'SETUP_SELECT_CANCEL')).setEmoji(`❌`),
            )
        );


        await slashCommand.reply({ ephemeral: true, embeds: [setupEmbed], components: [setupActionRow] });
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
