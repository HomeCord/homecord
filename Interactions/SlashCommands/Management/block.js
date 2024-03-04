const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "block",

    // Command's Description
    Description: `Add to your Server's Home Block List`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Add to your Server's Home Block List`,
        'en-US': `Add to your Server's Home Block List`
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
                name: "channel",
                description: "Add Channels to your Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Channels to your Home Block List",
                    'en-US': "Add Channels to your Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "category",
                description: "Add Categories to your Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Categories to your Home Block List",
                    'en-US': "Add Categories to your Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "role",
                description: "Add Roles to your Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add Roles to your Home Block List",
                    'en-US': "Add Roles to your Home Block List"
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

    await interaction.editReply({ components: [ChannelSelect], content: localize(interaction.locale, 'BLOCK_COMMAND_CHANNEL_INSTRUCTIONS') });

    return;
}






/**
 * Adds specified Categories to the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function addToCategoryBlockList(interaction)
{
    //.
}






/**
 * Adds specified Roles to the Server's Block List
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function addToRoleBlockList(interaction)
{
    //.
}
