import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';
import { GuildConfig } from '../../../Mongoose/Models.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { hexToRgb } from '../../../Utility/utilityMethods.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "setup",

    /** Command's Description
     * @type {String}
     */
    description: "Setup a Home Channel for your Server!",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Setup a Home Channel for your Server!',
        'en-US': 'Setup a Home Channel for your Server!'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 60,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "exampleName": 3
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Command Permission Requirement
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageGuild);

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, api, interactionUser) {
        await api.interactions.createAutocompleteResponse(interaction.id, interaction.token, { choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ] });

        return;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, api, interactionUser, usedCommandName) {
        // Ensure Guild doesn't already have a Home Channel setup
        if ( await GuildConfig.exists({ guildId: interaction.guild_id }) != null ) {
            await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, content: localize(interaction.locale, 'SETUP_COMMAND_ERROR_HOME_ALREADY_SETUP') });
            return;
        }


        // ***** Start setup process
        // Display config menu
        let setupEmbed = new EmbedBuilder().setColor(hexToRgb("#C0C0C0"))
        .setTitle(localize(interaction.locale, 'SETUP_EMBED_TITLE'))
        .setDescription(localize(interaction.locale, 'SETUP_EMBED_DESCRIPTION'))
        .addFields(
            { name: localize(interaction.locale, 'SETUP_EMBED_CHANNEL'), value: localize(interaction.locale, 'CREATE_CHANNEL_FOR_ME') },
            { name: localize(interaction.locale, 'SETUP_EMBED_HIGHLIGHT_MESSAGES'), value: localize(interaction.locale, 'LOW') },
            { name: localize(interaction.locale, 'SETUP_EMBED_HIGHLIGHT_SCHEDULED_EVENTS'), value: localize(interaction.locale, 'LOW') },
            //{ name: localize(interaction.locale, 'SETUP_EMBED_HIGHLIGHT_VOICE_ACTIVITY'), value: localize(interaction.locale, 'LOW') },
            //{ name: localize(interaction.locale, 'SETUP_EMBED_HIGHLIGHT_LIVE_STAGES'), value: localize(interaction.locale, 'LOW') },
            { name: localize(interaction.locale, 'SETUP_EMBED_HIGHLIGHT_ACTIVE_THREADS'), value: localize(interaction.locale, 'LOW') },
        )
        .setFooter({ text: localize(interaction.locale, 'SETUP_EMBED_FOOTER_STEP_ONE') });


        let setupActionRow = new ActionRowBuilder().addComponents(
            // *******  NOTE ABOUT THE CUSTOM ID
            // The bits after "setup-home_" are used to know what the set values are for each setting
            // In order:
            //   - Home Channel location ("c" = create for me; otherwise ID of Channel)
            //   - Activity Thresholds ("d" = disabled; "vl" = very low; "l" = low; "m" = medium; "h" = high; "vh" = very high) for the following:
            //     - Highlight Messages, Events, Voice, Stages, Threads (in that order)
            new StringSelectMenuBuilder().setCustomId('setup-home_c_l_l_l_l_l').setMaxValues(1).setMinValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION'))
            .addOptions(
                new StringSelectMenuOptionBuilder().setValue('CHANNEL').setLabel(localize(interaction.locale, 'SETUP_SELECT_CHANNEL')).setDescription(localize(interaction.locale, 'SETUP_EMBED_CHANNEL_DESCRIPTION')).setEmoji({ name: `⚙` }),
                new StringSelectMenuOptionBuilder().setValue('ACTIVITY_THRESHOLD').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_ACTIVITY')).setDescription(localize(interaction.locale, 'SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD')).setEmoji({ name: `📊` }),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_MESSAGES').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_MESSAGES')).setDescription(localize(interaction.locale, 'SETUP_SELECT_TOGGLE_MESSAGES')).setEmoji({ name: `ChannelText`, id: `997752062500671590` }),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_EVENTS').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_EVENTS')).setDescription(localize(interaction.locale, 'SETUP_SELECT_TOGGLE_EVENTS')).setEmoji({ name: `ScheduledEvent`, id: `1009372447503552514` }),
                //new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_VOICE').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_VOICE')).setDescription(localize(interaction.locale, 'SETUP_SELECT_TOGGLE_VOICE')).setEmoji({ name: `ChannelVoice`, id: `997752063612162138` }),
                //new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_STAGES').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_STAGES')).setDescription(localize(interaction.locale, 'SETUP_SELECT_TOGGLE_STAGES')).setEmoji({ name: `ChannelStage`, id: `997752061330464818` }),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_THREADS').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_THREADS')).setDescription(localize(interaction.locale, 'SETUP_SELECT_TOGGLE_THREADS')).setEmoji({ name: `ChannelForum`, id: `1029012363048914967` }),
                new StringSelectMenuOptionBuilder().setValue('SAVE_AND_CREATE').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_SAVE_AND_CREATE')).setDescription(localize(interaction.locale, 'SETUP_SELECT_SAVE')).setEmoji({ name: `✅` }),
                new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(interaction.locale, 'SETUP_SELECT_CANCEL')).setEmoji({ name: `❌` }),
            )
        );

        // ACK
        await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, embeds: [setupEmbed], components: [setupActionRow] });

        return;
    }
}
