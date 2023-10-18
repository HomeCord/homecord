const { StringSelectMenuInteraction, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { localize } = require("../../BotModules/LocalizationModule.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-home",

    // Select's Description
    Description: `Handles select options from /setup command`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {StringSelectMenuInteraction} selectInteraction 
     */
    async execute(selectInteraction)
    {
        // Grab option selected
        const SelectedOption = selectInteraction.values.pop();
        // Split up Custom ID
        const SettingValueKeys = selectInteraction.customId.split("_");
        SettingValueKeys.shift(); // Remove Custom ID itself

        // Act depending on which option was selected
        switch (SelectedOption)
        {
            // CHANNEL OPTION
            case 'CHANNEL':
                // Create Channel Select
                let channelSelect = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder().setCustomId(`setup-set-channel_${selectInteraction.customId.slice(11)}`).setChannelTypes([ChannelType.GuildText]).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_SELECT_PLACEHOLDER'))
                );
                // Create Buttons
                let channelButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`setup-create-channel_${selectInteraction.customId.slice(11)}`).setStyle(ButtonStyle.Primary).setLabel(localize(selectInteraction.locale, 'SETUP_CREATE_CHANNEL_BUTTON_LABEL'))
                );
                // Create Embed
                let channelEmbed = new EmbedBuilder().setTitle(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_DESCRIPTION')).setColor('Grey');
                // ACK
                await selectInteraction.update({ components: [channelSelect, channelButtons], embeds: [channelEmbed] });
                break;


            // CANCEL OPTION
            case 'CANCEL':
                await selectInteraction.update({ content: localize(selectInteraction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                await selectInteraction.update({ content: selectInteraction.message.content += `\n\n:warning: ${localize(selectInteraction.locale, 'SELECT_MENU_ERROR_GENERIC')}` });
                break;
        }

        return;
    }
}
