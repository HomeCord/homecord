const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "unblock",

    // Command's Description
    Description: `Remove Roles & Channels from this Server's Home Block List`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Remove Roles & Channels from this Server's Home Block List`,
        'en-US': `Remove Roles & Channels from this Server's Home Block List`
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
                description: "Remove Roles from this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Remove Roles from this Server's Home Block List",
                    'en-US': "Remove Roles from this Server's Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "category",
                description: "Remove Categories from this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Remove Categories from this Server's Home Block List",
                    'en-US': "Remove Categories from this Server's Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "channel",
                description: "Remove Channels from this Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Remove Channels from this Server's Home Block List",
                    'en-US': "Remove Channels from this Server's Home Block List"
                }
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

        // Fetch Subcommand used
        const InputSubcommand = interaction.options.getSubcommand(true);

        if ( InputSubcommand === "channel" ) { await removeFromChannelBlockList(interaction); }
        else if ( InputSubcommand === "category" ) { await removeFromCategoryBlockList(interaction); }
        else if ( InputSubcommand === "role" ) { await removeFromRoleBlockList(interaction); }

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
 * Removes specified Channels from the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function removeFromChannelBlockList(interaction)
{
    // Ensure there is actually stuff on the Block List to remove
    let fetchedChannelBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "CHANNEL" });
    if ( fetchedChannelBlocklist.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNBLOCK_COMMAND_ERROR_BLOCKLIST_EMPTY_ROLE', `\`/block channel\``) }); return; }


    // Construct Select
    const ChannelSelect = new ActionRowBuilder().addComponents([
        new ChannelSelectMenuBuilder()
            .setCustomId(`unblock-channel`)
            .setPlaceholder(localize(interaction.locale, 'UNBLOCK_COMMAND_SELECT_CHANNEL_PLACEHOLDER'))
            .setMinValues(1)
            .setMaxValues(fetchedChannelBlocklist.length)
            .addChannelTypes([ ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice ])
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);


    // ACK
    await interaction.editReply({ components: [ChannelSelect, DismissButton], content: localize(interaction.locale, 'UNBLOCK_COMMAND_CHANNEL_INSTRUCTIONS') });

    return;
}






/**
 * Remove specified Categories from the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function removeFromCategoryBlockList(interaction)
{
    // Ensure there is actually stuff on the Block List to remove
    let fetchedChannelBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "CATEGORY" });
    if ( fetchedChannelBlocklist.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNBLOCK_COMMAND_ERROR_BLOCKLIST_EMPTY_CATEGORY', `\`/block category\``) }); return; }


    // Construct Select
    const ChannelSelect = new ActionRowBuilder().addComponents([
        new ChannelSelectMenuBuilder()
            .setCustomId(`unblock-category`)
            .setPlaceholder(localize(interaction.locale, 'UNBLOCK_COMMAND_SELECT_CATEGORY_PLACEHOLDER'))
            .setMinValues(1)
            .setMaxValues(fetchedChannelBlocklist.length)
            .addChannelTypes([ ChannelType.GuildCategory ])
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);


    // ACK
    await interaction.editReply({ components: [ChannelSelect, DismissButton], content: localize(interaction.locale, 'UNBLOCK_COMMAND_CATEGORY_INSTRUCTIONS') });

    return;
}






/**
 * Remove specified Roles from the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function removeFromRoleBlockList(interaction)
{
    // Ensure there is actually stuff on the Block List to remove
    let fetchedRoleBlocklist = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "ROLE" });
    if ( fetchedRoleBlocklist.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'UNBLOCK_COMMAND_ERROR_BLOCKLIST_EMPTY_ROLE', `\`/block role\``) }); return; }


    // Construct Select
    const RoleSelect = new ActionRowBuilder().addComponents([
        new RoleSelectMenuBuilder()
            .setCustomId(`unblock-role`)
            .setPlaceholder(localize(interaction.locale, 'UNBLOCK_COMMAND_SELECT_ROLE_PLACEHOLDER'))
            .setMinValues(1)
            .setMaxValues(fetchedRoleBlocklist.length)
    ]);

    const DismissButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('dismiss').setLabel(localize(interaction.locale, 'BUTTON_CANCEL_GENERIC')).setStyle(ButtonStyle.Secondary)
    ]);


    // ACK
    await interaction.editReply({ components: [RoleSelect, DismissButton], content: localize(interaction.locale, 'UNBLOCK_COMMAND_ROLE_INSTRUCTIONS') });

    return;
}
