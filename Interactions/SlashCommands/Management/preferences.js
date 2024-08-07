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
                name: `view`,
                description: `View your current preferences in HomeCord`,
                descriptionLocalizations: {
                    'en-GB': `View your current preferences in HomeCord`,
                    'en-US': `View your current preferences in HomeCord`,
                },
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `edit`,
                description: `Edit your preferences in HomeCord`,
                descriptionLocalizations: {
                    'en-GB': `Edit your preferences in HomeCord`,
                    'en-US': `Edit your preferences in HomeCord`,
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "featureable",
                        description: "Can your own Messages be showcased in HomeCord's Home Channels? (Default: True)",
                        descriptionLocalizations: {
                            'en-GB': "Can your own Messages be showcased in HomeCord's Home Channels? (Default: True)",
                            'en-US': "Can your own Messages be showcased in HomeCord's Home Channels? (Default: True)"
                        },
                        required: true // Required for now, will make it false if more preferences are added in the future.
                    }
                ]
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

        // Fetch used Subcommand. If "edit" was used but no options included, send error message
        const SubcommandUsed = interaction.options.getSubcommand(true);

        if ( SubcommandUsed === "view" ) { await viewPreferences(interaction); }
        else if ( SubcommandUsed === "edit" && interaction.options.data[0].options.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'PREFERENCES_EDIT_ERROR_NO_OPTIONS_INCLUDED') }); }
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
    .setDescription(localize(interaction.locale, 'PREFERENCES_VIEW_EMBED_DESCRIPTION', `</preferences edit:${interaction.commandId}>`))
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
    // Fetch all options
    let featureableOption = interaction.options.getBoolean("featureable");

    // Fetch current User preferences
    let userPreferences = await UserConfig.findOne({ userId: interaction.user.id });
    // If does not exist, create it
    if ( userPreferences == null ) { userPreferences = await UserConfig.create({ userId: interaction.user.id }); }

    // Create Embed
    const UpdateEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'PREFERENCES_EDIT_EMBED_TITLE'))
    .setDescription(localize(interaction.locale, 'PREFERENCES_EDIT_EMBED_DESCRIPTION', `</preferences view:${interaction.commandId}>`));

    
    // Now go through the options, changing their values & adding them to Embed
    if ( featureableOption != null )
    {
        userPreferences.isHighlightable = featureableOption;
        UpdateEmbed.addFields({ name: localize(interaction.locale, 'PREFERENCES_VIEW_EMBED_HIGHLIGHTABLE'), value: localize(interaction.locale, featureableOption ? 'TRUE' : 'FALSE') });
    }


    // Save to DB
    await userPreferences.save();

    // ACK
    await interaction.editReply({ embeds: [UpdateEmbed] });
    return;
}
