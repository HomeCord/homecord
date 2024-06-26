const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "block",

    // Command's Description
    Description: `Add Roles & Channels to this Server's Home Block List`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Add Roles & Channels to this Server's Home Block List`,
        'en-US': `Add Roles & Channels to this Server's Home Block List`
    },

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 15,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "channel": 30,
        "category": 30,
        "role": 30
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "channel": "GUILD",
        "category": "GUILD",
        "role": "GUILD"
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
        Data.dmPermission = false;
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "role",
                description: "Add Roles to this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Roles to this Server's Home Block List",
                    'en-US': "Add Roles to this Server's Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "category",
                description: "Add Categories to this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Categories to this Server's Home Block List",
                    'en-US': "Add Categories to this Server's Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "channel",
                description: "Add Channels to this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Channels to this Server's Home Block List",
                    'en-US': "Add Channels to this Server's Home Block List"
                }
            },
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

        // Fetch Subcommand used
        const InputSubcommand = interaction.options.getSubcommand(true);

        if ( InputSubcommand === "channel" ) { await addToChannelBlockList(interaction); }
        else if ( InputSubcommand === "category" ) { await addToCategoryBlockList(interaction); }
        else if ( InputSubcommand === "role" ) { await addToRoleBlockList(interaction); }

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
 * Adds specified Channels to the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function addToChannelBlockList(interaction)
{
    // Check if max Channel blocking has been reached
    let fetchedChannelBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "CHANNEL" });
    if ( fetchedChannelBlocklist.length === 25 ) { await interaction.editReply({ content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_MAXIMUM_BLOCKED_CHANNELS_REACHED', `\`/unblock channel\``) }); return; }

    // Figure out how many slots are left
    let blockSlotsLeft = 25 - fetchedChannelBlocklist.length;

    // ACK with Select
    const ChannelSelect = new ActionRowBuilder().addComponents([
        new ChannelSelectMenuBuilder()
            .setCustomId(`block-channel`)
            .setPlaceholder(localize(interaction.locale, 'BLOCK_COMMAND_SELECT_PLACEHOLDER_CHANNEL', blockSlotsLeft))
            .setMinValues(1)
            .setMaxValues(blockSlotsLeft)
            .addChannelTypes([ ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice ])
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);

    await interaction.editReply({ components: [ChannelSelect, DismissButton], content: localize(interaction.locale, 'BLOCK_COMMAND_CHANNEL_INSTRUCTIONS', `${blockSlotsLeft}`) });

    return;
}






/**
 * Adds specified Categories to the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function addToCategoryBlockList(interaction)
{
    // Check if max Category blocking has been reached
    let fetchedCategoryBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "CATEGORY" });
    if ( fetchedCategoryBlocklist.length === 25 ) { await interaction.editReply({ content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_MAXIMUM_BLOCKED_CATEGORIES_REACHED', `\`/unblock category\``) }); return; }

    // Figure out how many slots are left
    let blockSlotsLeft = 25 - fetchedCategoryBlocklist.length;

    // ACK with Select
    const ChannelSelect = new ActionRowBuilder().addComponents([
        new ChannelSelectMenuBuilder()
            .setCustomId(`block-category`)
            .setPlaceholder(localize(interaction.locale, 'BLOCK_COMMAND_SELECT_PLACEHOLDER_CATEGORY', blockSlotsLeft))
            .setMinValues(1)
            .setMaxValues(blockSlotsLeft)
            .addChannelTypes([ ChannelType.GuildCategory ])
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);

    await interaction.editReply({ components: [ChannelSelect, DismissButton], content: localize(interaction.locale, 'BLOCK_COMMAND_CATEGORY_INSTRUCTIONS', `${blockSlotsLeft}`) });

    return;
}






/**
 * Adds specified Roles to the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function addToRoleBlockList(interaction)
{
    // Check if max Role blocking has been reached
    let fetchedRoleBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "ROLE" });
    if ( fetchedRoleBlocklist.length === 25 ) { await interaction.editReply({ content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_MAXIMUM_BLOCKED_ROLES_REACHED', `\`/unblock role\``) }); return; }

    // Figure out how many slots are left
    let blockSlotsLeft = 25 - fetchedRoleBlocklist.length;

    // ACK with Select
    const RoleSelect = new ActionRowBuilder().addComponents([
        new RoleSelectMenuBuilder()
            .setCustomId(`block-role`)
            .setPlaceholder(localize(interaction.locale, 'BLOCK_COMMAND_SELECT_PLACEHOLDER_ROLE', blockSlotsLeft))
            .setMinValues(1)
            .setMaxValues(blockSlotsLeft)
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);

    await interaction.editReply({ components: [RoleSelect, DismissButton], content: localize(interaction.locale, 'BLOCK_COMMAND_ROLE_INSTRUCTIONS', `${blockSlotsLeft}`) });

    return;
}
