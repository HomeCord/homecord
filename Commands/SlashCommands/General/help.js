import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, ButtonStyle } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';
import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { localize } from '../../../Utility/localizeResponses.js';
import { UrlAddAppShort, UrlChangelog, UrlDocumentation, UrlDonations, UrlGitHub, UrlPrivacyPolicy, UrlSupportServer, UrlTermsOfService } from '../../../Resources/hyperlinks.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "help",

    /** Command's Description
     * @type {String}
     */
    description: "Shows information about HomeCord and its official links.",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Shows information about HomeCord and its official links.',
        'en-US': 'Shows information about HomeCord and its official links.'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,

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
        // Construct Buttons
        const ChangelogButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_CHANGELOG')).setURL(UrlChangelog);
        const PrivacyButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_PRIVACY')).setURL(UrlPrivacyPolicy);
        const TermsButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_TERMS')).setURL(UrlTermsOfService);
        const GitHubButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_GITHUB')).setURL(UrlGitHub);
        const SupportButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_SUPPORT')).setURL(UrlSupportServer);
        const InviteButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_INVITE')).setURL(UrlAddAppShort);
        const DocumentationButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_DOCUMENTATION')).setURL(UrlDocumentation);
        const DonateButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_DONATE')).setURL(UrlDonations);

        // Construct Select
        const HelpSelect = new StringSelectMenuBuilder().setCustomId("help-pages").setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'HELP_COMMAND_MENU_PLACEHOLDER')).addOptions([
            new StringSelectMenuOptionBuilder().setValue("index").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_INDEX')),
            new StringSelectMenuOptionBuilder().setValue("setup-guide").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_SETUP_GUIDE')),
            new StringSelectMenuOptionBuilder().setValue("config-guide").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_CONFIG_GUIDE')),
            new StringSelectMenuOptionBuilder().setValue("highlight-vs-feature").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_HIGHLIGHT_VS_FEATURE')),
            new StringSelectMenuOptionBuilder().setValue("message-privacy").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_MESSAGE_PRIVACY')),
            new StringSelectMenuOptionBuilder().setValue("blocklist").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_BLOCKLIST')),
            new StringSelectMenuOptionBuilder().setValue("command-list").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_COMMAND_LIST')),
            new StringSelectMenuOptionBuilder().setValue("command-permissions").setLabel(localize(interaction.locale, 'HELP_COMMAND_MENU_COMMAND_PERMISSIONS')),
        ]);

        // Slap into rows
        const HelpRows = [
            new ActionRowBuilder().addComponents([ InviteButton, SupportButton, ChangelogButton, DonateButton ]),
            new ActionRowBuilder().addComponents([ TermsButton, PrivacyButton, GitHubButton, DocumentationButton ]),
            new ActionRowBuilder().addComponents([ HelpSelect ])
        ];

        await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, components: HelpRows, content: localize(interaction.locale, 'HELP_COMMAND_PAGE_INDEX') });

        return;
    }
}
