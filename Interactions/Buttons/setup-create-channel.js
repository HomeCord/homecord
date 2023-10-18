const { ButtonInteraction } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { setupMainPage } = require("../../BotModules/SetupPages.js");

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-create-channel",

    // Button's Description
    Description: `Sets the Home Channel setting to "Create for me"`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Button
     * @param {ButtonInteraction} buttonInteraction 
     */
    async execute(buttonInteraction)
    {
        // Store into custom ID
        let settingValues = buttonInteraction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        settingValues[0] = `c`; // Replace Channel value

        // Swap back to main page
        await buttonInteraction.update(setupMainPage(buttonInteraction.locale, settingValues));
        return;
    }
}
