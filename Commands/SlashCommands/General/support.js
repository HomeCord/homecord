import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, ButtonStyle } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { localize } from '../../../Utility/localizeResponses.js';
import { UrlDocumentation, UrlGitHub, UrlSupportServer } from '../../../Resources/hyperlinks.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "support",

    /** Command's Description
     * @type {String}
     */
    description: "Shows you how to gain support with HomeCord",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Shows you how to gain support with HomeCord',
        'en-US': 'Shows you how to gain support with HomeCord'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

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
        // Put link into Link Button
        const SupportActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'SUPPORT_COMMAND_DOCS_BUTTON_LABEL')).setURL(UrlDocumentation),
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'SUPPORT_COMMAND_SERVER_BUTTON_LABEL')).setURL(UrlSupportServer),
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'SUPPORT_COMMAND_GITHUB_BUTTON_LABEL')).setURL(UrlGitHub)
        ]);

        await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, components: [SupportActionRow], content: localize(interaction.locale, 'SUPPORT_COMMAND_RESPONSE') });

        return;
    }
}
