const { StringSelectMenuInteraction, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
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
                let channelEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ embeds: [channelEmbed], components: [channelSelect, channelButtons] });
                break;


            // ACTIVITY THRESHOLD OPTION
            case 'ACTIVITY_THRESHOLD':
                // Create Activity Select
                let activitySelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-activity_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`VERY_LOW`).setLabel(localize(selectInteraction.locale, 'VERY_LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`LOW`).setLabel(localize(selectInteraction.locale, 'LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`MEDIUM`).setLabel(localize(selectInteraction.locale, 'MEDIUM')),
                        new StringSelectMenuOptionBuilder().setValue(`HIGH`).setLabel(localize(selectInteraction.locale, 'HIGH')),
                        //new StringSelectMenuOptionBuilder().setValue(`VERY_HIGH`).setLabel(localize(selectInteraction.locale, 'VERY_HIGH')) // Saving this option as a future premium option
                    )
                );
                // Create Embed
                let activityEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_SET_ACTIVITY_EMBED_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_SET_ACTIVITY_EMBED_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ embeds: [activityEmbed], components: [activitySelect] });
                break;


            // CANCEL OPTION
            case 'CANCEL':
                await selectInteraction.update({ content: localize(selectInteraction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                await selectInteraction.update({ content: `\n\n:warning: ${localize(selectInteraction.locale, 'SELECT_MENU_ERROR_GENERIC')}` });
                break;
        }

        return;
    }
}
