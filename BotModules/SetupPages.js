const { Locale, InteractionUpdateOptions, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { localize } = require('./LocalizationModule');


/**
 * Main Setup Page
 * @param {Locale} locale 
 * @param {String[]} settingValues 
 * 
 * @returns {InteractionUpdateOptions}
 */
exports.setupMainPage = (locale, settingValues) => {
    // Embed
    let setupEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(locale, 'SETUP_EMBED_TITLE'))
    .setDescription(localize(locale, 'SETUP_EMBED_DESCRIPTION'))
    .addFields(
        { name: localize(locale, 'SETUP_EMBED_CHANNEL'), value: settingValues[0] === 'c' ? localize(locale, 'CREATE_CHANNEL_FOR_ME') : `<#${settingValues[0]}>` },
        { name: localize(locale, 'SETUP_EMBED_ACTIVITY_THRESHOLD'), value: localize(locale, settingValues[1] === 'vl' ? 'VERY_LOW' : settingValues[1] === 'l' ? 'LOW' : settingValues[1] === 'm' ? 'MEDIUM' : settingValues[1] === 'h' ? 'HIGH' : 'VERY_HIGH') },
        { name: localize(locale, 'SETUP_EMBED_HIGHLIGHT_MESSAGES'), value: localize(locale, settingValues[2] === 't' ? 'TRUE' : 'FALSE') },
        { name: localize(locale, 'SETUP_EMBED_HIGHLIGHT_SCHEDULED_EVENTS'), value: localize(locale, settingValues[3] === 't' ? 'TRUE' : 'FALSE') },
        { name: localize(locale, 'SETUP_EMBED_HIGHLIGHT_VOICE_ACTIVITY'), value: localize(locale, settingValues[4] === 't' ? 'TRUE' : 'FALSE') },
        { name: localize(locale, 'SETUP_EMBED_HIGHLIGHT_LIVE_STAGES'), value: localize(locale, settingValues[5] === 't' ? 'TRUE' : 'FALSE') },
        { name: localize(locale, 'SETUP_EMBED_HIGHLIGHT_ACTIVE_THREADS'), value: localize(locale, settingValues[6] === 't' ? 'TRUE' : 'FALSE') },
    )
    .setFooter({ text: localize(locale, 'SETUP_EMBED_FOOTER_STEP_ONE') });

    // Select
    let setupActionRow = new ActionRowBuilder().addComponents(
        // *******  NOTE ABOUT THE CUSTOM ID
        // The bits after "setup-home_" are used to know what the set values are for each setting
        // In order:
        //   - Home Channel location ("c" = create for me; otherwise ID of Channel)
        //   - Activity Threshold ("vl" = very low; "l" = low; "m" = medium; "h" = high; "vh" = very high)
        //   - Highlight Messages, Events, Voice, Stages, Threads (in that order. "t" = true; "f" = false)
        new StringSelectMenuBuilder().setCustomId(`setup-home_${settingValues.join('_')}`).setMaxValues(1).setMinValues(1).setPlaceholder(localize(locale, 'PLEASE_SELECT_AN_OPTION'))
        .addOptions(
            new StringSelectMenuOptionBuilder().setValue('CHANNEL').setLabel(localize(locale, 'SETUP_SELECT_CHANNEL')).setDescription(localize(locale, 'SETUP_EMBED_CHANNEL_DESCRIPTION')).setEmoji(`⚙`),
            new StringSelectMenuOptionBuilder().setValue('ACTIVITY_THRESHOLD').setLabel(localize(locale, 'SETUP_SELECT_LABEL_ACTIVITY')).setDescription(localize(locale, 'SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD')).setEmoji(`📊`),
            new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_MESSAGES').setLabel(localize(locale, 'SETUP_SELECT_LABEL_MESSAGES')).setDescription(localize(locale, 'SETUP_SELECT_TOGGLE_MESSAGES')).setEmoji(`<:ChannelText:997752062500671590>`),
            new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_EVENTS').setLabel(localize(locale, 'SETUP_SELECT_LABEL_EVENTS')).setDescription(localize(locale, 'SETUP_SELECT_TOGGLE_EVENTS')).setEmoji(`<:ScheduledEvent:1009372447503552514>`),
            new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_VOICE').setLabel(localize(locale, 'SETUP_SELECT_LABEL_VOICE')).setDescription(localize(locale, 'SETUP_SELECT_TOGGLE_VOICE')).setEmoji(`<:ChannelVoice:997752063612162138>`),
            new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_STAGES').setLabel(localize(locale, 'SETUP_SELECT_LABEL_STAGES')).setDescription(localize(locale, 'SETUP_SELECT_TOGGLE_STAGES')).setEmoji(`<:ChannelStage:997752061330464818>`),
            new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_THREADS').setLabel(localize(locale, 'SETUP_SELECT_LABEL_THREADS')).setDescription(localize(locale, 'SETUP_SELECT_TOGGLE_THREADS')).setEmoji(`<:ChannelForum:1029012363048914967>`),
            new StringSelectMenuOptionBuilder().setValue('SAVE_AND_CREATE').setLabel(localize(locale, 'SETUP_SELECT_LABEL_SAVE_AND_CREATE')).setDescription(localize(locale, 'SETUP_SELECT_SAVE')).setEmoji(`✅`),
            new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(locale, 'SETUP_SELECT_CANCEL')).setEmoji(`❌`),
        )
    );


    return { content: null, embeds: [setupEmbed], components: [setupActionRow] };
};
