const { StringSelectMenuInteraction } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { setupMainPage } = require("../../BotModules/SetupPages.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-set-stage",

    // Select's Description
    Description: `Toggles Stage Highlighting for the Home Channel`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {StringSelectMenuInteraction} selectInteraction 
     */
    async execute(selectInteraction)
    {
        // Fetch selected option
        const SelectedOption = selectInteraction.values.shift();

        // Store into Custom ID
        let settingValues = selectInteraction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        // Replace old value
        settingValues[5] = SelectedOption === 'TRUE' ? 't' : 'f';

        // Return to main setup page
        await selectInteraction.update(setupMainPage(selectInteraction.locale, settingValues));
        return;
    }
}
