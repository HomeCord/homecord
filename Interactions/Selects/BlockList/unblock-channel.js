const { ChannelSelectMenuInteraction } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");
const { LogError } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "unblock-channel",

    // Select's Description
    Description: `Removes the selected Channels from the Server's Block List`,

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

        // Fetch all Channels inputted
        let inputChannels = interaction.channels;

        // Find Channels in DB
        let dbFilter = [];
        inputChannels.forEach(channel => {
            dbFilter.push({ blockedId: channel.id });
        });

        await GuildBlocklist.find({ guildId: interaction.guildId, $or: dbFilter })
        .then(async existingEntries => {

            // CHANNELS WERE FOUND IN DB, REMOVE THEM
            if ( existingEntries.length >= 1 )
            {
                // Check Channels NOT in DB
                let channelsInDb = [];
                existingEntries.forEach(document => {
                    channelsInDb.push(document.blockedId);
                    inputChannels.delete(document.blockedId); // Remove from list of Channels to add
                });

                if ( channelsInDb.size < 1 ) { await interaction.editReply({ components: [], content: localize(interaction.locale, 'UNBLOCK_COMMAND_ALL_CHANNELS_NOT_BLOCKED') }); return; }

                // Remove Channels already in DB from the DB
                let removeChannelDocuments = [];
                channelsInDb.forEach(channelId => {
                    removeChannelDocuments.push({ blockedId: channelId });
                });

                await GuildBlocklist.deleteMany({ $or: removeChannelDocuments })
                .then(async oldDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'UNBLOCK_COMMAND_CHANNEL_SUCCESSFUL', channelsInDb.map(channelId => `<#${channelId}>`).join(', '))}${inputChannels.size > 0 ? `\n\n${localize(interaction.locale, 'UNBLOCK_COMMAND_CHANNEL_NOT_BLOCKED', inputChannels.map(channel => `<#${channel.id}>`).join(', '))}` : ''}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'UNBLOCK_COMMAND_ERROR_CHANNEL_GENERIC') });

                    return;
                });

                return;
            }
            // CHANNELS NOT FOUND, THUS CANNOT REMOVE
            else
            {
                await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'UNBLOCK_COMMAND_ALL_CHANNELS_NOT_BLOCKED')}` });

                return;
            }

        });
    }
}
