const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "help",

    // Command's Description
    Description: `Shows more information about HomeCord and its official links.`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Shows more information about HomeCord and its official links.`,
        'en-US': `Shows more information about HomeCord and its official links.`
    },

    // Command's Category
    Category: "GENERAL",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 5,

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

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        // Construct Buttons
        const ChangelogButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_CHANGELOG')).setURL("https://github.com/HomeCord/homecord/releases");
        const PrivacyButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_PRIVACY')).setURL("https://homecord.gitbook.io/docs/legal/privacy-policy");
        const TermsButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_TERMS')).setURL("https://homecord.gitbook.io/docs/legal/terms-of-service");
        const GitHubButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_GITHUB')).setURL("https://github.com/HomeCord/homecord");
        const SupportButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_SUPPORT')).setURL("https://discord.gg/BdXQjkADgd");
        const InviteButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_INVITE')).setURL("https://discord.com/oauth2/authorize?client_id=1156152328290840606&permissions=537250896&scope=applications.commands+bot");
        const DocumentationButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(localize(interaction.locale, 'HELP_COMMAND_BUTTON_DOCUMENTATION')).setURL("https://homecord.gitbook.io/docs");

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
            new ActionRowBuilder().addComponents([ InviteButton, SupportButton, ChangelogButton ]),
            new ActionRowBuilder().addComponents([ TermsButton, PrivacyButton, GitHubButton, DocumentationButton ]),
            new ActionRowBuilder().addComponents([ HelpSelect ])
        ];

        // ACK
        await interaction.reply({ ephemeral: true, components: HelpRows, content: localize(interaction.locale, 'HELP_COMMAND_PAGE_INDEX') });
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
