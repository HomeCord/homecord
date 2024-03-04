const { Message, PartialMessage, GuildTextBasedChannel, Collection } = require("discord.js");
const { TimerModel, FeaturedMessage } = require("../../Mongoose/Models");
const { refreshMessagesAudio } = require("../HomeModule");


module.exports = {

    /**
     * Removes anything connected to the deleted Message ID from the DB
     * 
     * @param {Message} message 
     */
    async removeMessage(message)
    {
        // Check for entries
        let hasTimers = await TimerModel.exists({ $or: [ { originalMessageId: message.id }, { featuredMessageId: message.id } ] });
        let hasMessage = await FeaturedMessage.exists({ $or: [ { originalMessageId: message.id }, { featuredMessageId: message.id } ] });

        
        // Purge if true
        if ( hasTimers != null ) { await TimerModel.deleteMany({ $or: [ { originalMessageId: message.id }, { featuredMessageId: message.id } ] }); }
        if ( hasMessage != null )
        {
            await FeaturedMessage.deleteMany({ $or: [ { originalMessageId: message.id }, { featuredMessageId: message.id } ] });
            await refreshMessagesAudio(message.guildId, message?.guild?.preferredLocale);
        }

        return;
    },






    /**
     * Removes anything connected to the bulk deleted Messages from the DB
     * 
     * @param {Collection<String, Message<Boolean>|PartialMessage>} messageCollection 
     * @param {GuildTextBasedChannel} channel
     */
    async bulkRemoveMessages(messageCollection, channel)
    {

        // Make Filter Array from Collection
        let filterArray = [];
        messageCollection.forEach(message => {
            filterArray.push({ originalMessageId: message.id });
            filterArray.push({ featuredMessageId: message.id });
        });

        
        // Check for entries
        let hasTimers = await TimerModel.exists({ $or: filterArray });
        let hasMessage = await FeaturedMessage.exists({ $or: filterArray });

        
        // Purge if true
        if ( hasTimers != null ) { await TimerModel.deleteMany({ $or: filterArray }); }
        if ( hasMessage != null )
        {
            await FeaturedMessage.deleteMany({ $or: filterArray });
            await refreshMessagesAudio(channel.guildId, channel.guild.preferredLocale);
        }

        return;
    }

}
