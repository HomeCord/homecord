const { StringSelectMenuInteraction } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { setupMainPage } = require("../../../BotModules/SetupPages.js");

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
     * @param {StringSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        // Fetch selected option
        const SelectedActivityThreshold = interaction.values.shift();

        // Store into Custom ID
        let settingValues = interaction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        // Replace old value
        settingValues[1] = SelectedActivityThreshold === 'VERY_LOW' ? 'vl' : SelectedActivityThreshold === 'LOW' ? 'l' : SelectedActivityThreshold === 'MEDIUM' ? 'm' : SelectedActivityThreshold === 'HIGH' ? 'h' : 'vh';

        // Return to main setup page
        await interaction.update(setupMainPage(interaction.locale, settingValues));
        return;
    }
}
