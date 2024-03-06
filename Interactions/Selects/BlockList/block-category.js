const { ChannelSelectMenuInteraction } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");
const { LogError } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "block-category",

    // Select's Description
    Description: `Adds the selected Categories to the Server's Block List`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 5,



    /**
     * Executes the Select
     * @param {ChannelSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        await interaction.deferUpdate();

        // Fetch all Categories inputted
        let inputChannels = interaction.channels;

        // Filter out Categories already added in DB
        let dbFilter = [];
        inputChannels.forEach(channel => {
            dbFilter.push({ blockedId: channel.id });
        });

        await GuildBlocklist.find({ guildId: interaction.guildId, $or: dbFilter })
        .then(async existingEntries => {

            if ( existingEntries.length >= 1 )
            {
                // Check Categories already added
                let alreadyAddedChannels = [];
                existingEntries.forEach(document => {
                    alreadyAddedChannels.push(document.blockedId);
                    inputChannels.delete(document.blockedId); // Remove from list of Categories to add
                });

                if ( inputChannels.size < 1 ) { await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ALL_CATEGORIES_ALREADY_ADDED') }); return; }

                // Add Categories NOT already in DB to the DB
                let addChannelDocuments = [];
                inputChannels.forEach(channel => {
                    addChannelDocuments.push({ guildId: interaction.guildId, blockType: "CATEGORY", blockedId: channel.id });
                });

                await GuildBlocklist.create(addChannelDocuments)
                .then(async newDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'BLOCK_COMMAND_CATEGORY_SUCCESSFUL', inputChannels.map(channel => `<#${channel.id}>`).join(', '))}\n\n${localize(interaction.locale, 'BLOCK_COMMAND_SOME_CATEGORIES_ALREADY_ADDED', alreadyAddedChannels.map(existingChannel => `<#${existingChannel}>`).join(', '))}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_GENERIC_CATEGORIES') });

                    return;
                });

                return;
            }
            else
            {
                // Add Roles  to the DB
                let addChannelDocuments = [];
                inputChannels.forEach(channel => {
                    addChannelDocuments.push({ guildId: interaction.guildId, blockType: "CATEGORY", blockedId: channel.id });
                });

                await GuildBlocklist.create(addChannelDocuments)
                .then(async newDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'BLOCK_COMMAND_CATEGORY_SUCCESSFUL', inputChannels.map(channel => `<#${channel.id}>`).join(', '))}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_GENERIC_CATEGORIES') });

                    return;
                });

                return;
            }

        });
    }
}
