const { StringSelectMenuInteraction } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "help-pages",

    // Select's Description
    Description: `Handles showing the specified help pages in the Help Command`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {StringSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        // Grab selected page and display its...page
        const SelectedPage = interaction.values.shift();

        switch (SelectedPage)
        {
            case "index":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_INDEX') });
                break;
                
            case "setup-guide":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_SETUP_GUIDE') });
                break;

            case "config-guide":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_CONFIG_GUIDE') });
                break;

            case "highlight-vs-feature":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_HIGHLIGHT_VS_FEATURE') });
                break;

            case "message-privacy":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_MESSAGE_PRIVACY') });
                break;

            case "blocklist":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_BLOCKLIST') });
                break;

            case "command-list":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_COMMAND_LIST') });
                break;

            case "command-permissions":
                await interaction.update({ content: localize(interaction.locale, 'HELP_COMMAND_PAGE_COMMAND_PERMISSIONS') });
                break;

            default:
                await interaction.update({ content: localize(interaction.locale, 'SELECT_MENU_ERROR_GENERIC') });
                break;
        }

        return;
    }
}
