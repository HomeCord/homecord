const { ButtonInteraction, PermissionFlagsBits } = require("discord.js");
const { DiscordClient, Collections } = require("../../../constants.js");
const { setupMainPage } = require("../../../BotModules/SetupPages.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");

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
     * @param {ButtonInteraction} interaction 
     */
    async execute(interaction)
    {
        // Store into custom ID
        let settingValues = interaction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        settingValues[0] = `c`; // Replace Channel value

        // Ensure Bot has Permissions
        if ( (await interaction.guild.members.fetch(DiscordClient.user.id)).permissions.has(PermissionFlagsBits.ManageChannels) === false )
        {
            await interaction.reply({ ephemeral: true, content: localize(interaction.locale, 'SETUP_SET_CHANNEL_ERROR_MISSING_MANAGE_CHANNEL_PERMISSION') });
            return;
        }

        // Swap back to main page
        await interaction.update(setupMainPage(interaction.locale, settingValues));
        return;
    }
}
