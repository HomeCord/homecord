const { AutocompleteInteraction } = require("discord.js");
const { Collections } = require("../../constants.js");
const { localize } = require("../LocalizationModule.js");

module.exports = {
    /**
     * Handles and runs received Autocomplete Interactions
     * @param {AutocompleteInteraction} autocompleteInteraction 
     */
    async Main(autocompleteInteraction)
    {
        // Find Slash Command with matching name
        const SlashCommand = Collections.SlashCommands.get(autocompleteInteraction.commandName);
        if ( !SlashCommand ) { await autocompleteInteraction.respond([{name: `${localize(autocompleteInteraction.locale, 'AUTOCOMPLETE_ERROR_GENERIC')}`, value: "ERROR_FAILED"}]); return; }

        // Pass to Command's Autocomplete Method
        return await SlashCommand.autocomplete(autocompleteInteraction);
    }
}
