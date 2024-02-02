const { ChannelSelectMenuInteraction, ChannelType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");
const { setupMainPage } = require("../../../BotModules/SetupPages");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-set-channel",

    // Select's Description
    Description: `Checks & sets an existing Channel to be used as the Home Channel`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {ChannelSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        // Fetch Channel selected
        const SelectedChannel = interaction.channels.first();
        
        if ( SelectedChannel == undefined )
        {
            await interaction.update({ content: localize(interaction.locale, 'SELECT_MENU_ERROR_GENERIC') });
            return;
        }

        // Just in case, validate Channel is Text Channel
        if ( SelectedChannel.type != ChannelType.GuildText )
        {
            await interaction.update({ content: localize(interaction.locale, 'SETUP_SET_CHANNEL_ERROR_INVALID_CHANNEL_TYPE') });
            return;
        }

        // Store into custom ID
        let settingValues = interaction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        settingValues[0] = `${SelectedChannel.id}`; // Replace Channel value

        
        // Return to main Setup Page
        await interaction.update(setupMainPage(interaction.locale, settingValues));
        return;
    }
}
