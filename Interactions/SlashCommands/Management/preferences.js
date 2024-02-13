const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { UserConfig } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");

const PlaceholderPreferences = {
    isHighlightable: true
};

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "preferences",

    // Command's Description
    Description: `View or edit your own preferences in HomeCord`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `View or edit your own preferences in HomeCord`,
        'en-US': `View or edit your own preferences in HomeCord`
    },

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "example": 2,
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "example": "GUILD",
    },



    /**
     * Returns data needed for registering Slash Command onto Discord's API
     * @returns {ChatInputApplicationCommandData}
     */
    registerData()
    {
        /** @type {ChatInputApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = this.Description;
        Data.descriptionLocalizations = this.LocalisedDescriptions;
        Data.type = ApplicationCommandType.ChatInput;
        Data.dmPermission = true;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "featureable",
                description: "Can your own Messages be featured in HomeCord's Home Channels? (Default: True)",
                descriptionLocalizations: {
                    'en-GB': "Can your own Messages be featured in HomeCord's Home Channels? (Default: True)",
                    'en-US': "Can your own Messages be featured in HomeCord's Home Channels? (Default: True)"
                },
                required: false
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });

        // if no options provided, default to "View" mode - otherwise, "Edit" mode
        if ( interaction.options.data.length === 0 ) { await viewPreferences(interaction); }
        else { await editPreferences(interaction); }

        return;
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction)
    {
        //.
    }
}









/**
 * Shows the current preferences for the User running the Command
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function viewPreferences(interaction)
{
    // Fetch Preferences
    // if does not exist, use the temp object defined at top of this file
    let userPreferences = await UserConfig.findOne({ userId: interaction.user.id });
    if ( userPreferences == null ) { userPreferences = PlaceholderPreferences; }

    // Put into Embed
    const PreferenceEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'PREFERENCES_VIEW_EMBED_TITLE'))
    .setDescription(localize(interaction.locale, 'PREFERENCES_VIEW_EMBED_DESCRIPTION', `</preferences:${interaction.commandId}>`))
    .addFields(
        { name: localize(interaction.locale, 'PREFERENCES_VIEW_EMBED_HIGHLIGHTABLE'), value: localize(interaction.locale, userPreferences.isHighlightable ? 'TRUE' : 'FALSE') }
    );

    // ACK
    await interaction.editReply({ embeds: [PreferenceEmbed] });
    return;
}









/**
 * Edits the preferences for the User running the Command using the given values
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function editPreferences(interaction)
{
    //.
}
