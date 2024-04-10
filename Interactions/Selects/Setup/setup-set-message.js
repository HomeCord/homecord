const { StringSelectMenuInteraction } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { setupMainPage } = require("../../../BotModules/SetupPages.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-set-message",

    // Select's Description
    Description: `Toggles Message Highlighting for the Home Channel`,

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
        const SelectedOption = interaction.values.shift();

        // Store into Custom ID
        let settingValues = interaction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        // Replace old value
        settingValues[1] = SelectedOption === 'VERY_LOW' ? 'vl' : SelectedOption === 'LOW' ? 'l' : SelectedOption === 'MEDIUM' ? 'm' : SelectedOption === 'HIGH' ? 'h' : SelectedOption === 'VERY_HIGH' ? 'vh' : 'd';

        // Return to main setup page
        await interaction.update(setupMainPage(interaction.locale, settingValues));
        return;
    }
}
