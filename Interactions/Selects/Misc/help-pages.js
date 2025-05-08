import { API, MessageFlags } from '@discordjs/core';
import { localize } from '../../../Utility/localizeResponses.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "help-pages",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles showing the specified help pages in the Help Command",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, api, interactionUser) {
        // Grab selected page and display its...page
        const SelectedPage = interaction.data.values.shift();

        switch (SelectedPage)
        {
            case "index":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_INDEX') });
                break;
                
            case "setup-guide":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_SETUP_GUIDE') });
                break;

            case "config-guide":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_CONFIG_GUIDE') });
                break;

            case "highlight-vs-feature":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_HIGHLIGHT_VS_FEATURE') });
                break;

            case "message-privacy":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_MESSAGE_PRIVACY') });
                break;

            case "blocklist":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_BLOCKLIST') });
                break;

            case "command-list":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_COMMAND_LIST') });
                break;

            case "command-permissions":
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'HELP_COMMAND_PAGE_COMMAND_PERMISSIONS') });
                break;

            default:
                await api.interactions.updateMessage(interaction.id, interaction.token, { content: localize(interaction.locale, 'SELECT_MENU_ERROR_GENERIC') });
                break;
        }

        return;
    }
}
