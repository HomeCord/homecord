const { StringSelectMenuInteraction } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { setupMainPage } = require("../../BotModules/SetupPages.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-set-activity",

    // Select's Description
    Description: `Sets the Activity Threshold for the Home Channel`,

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
        const SelectedActivityThreshold = selectInteraction.values.shift();

        // Store into Custom ID
        let settingValues = selectInteraction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        // Replace old value
        settingValues[1] = SelectedActivityThreshold === 'VERY_LOW' ? 'vl' : SelectedActivityThreshold === 'LOW' ? 'l' : SelectedActivityThreshold === 'MEDIUM' ? 'm' : SelectedActivityThreshold === 'HIGH' ? 'h' : 'vh';

        // Return to main setup page
        await selectInteraction.update(setupMainPage(selectInteraction.locale, settingValues));
        return;
    }
}
