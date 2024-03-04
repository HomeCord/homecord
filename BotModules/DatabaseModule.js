const { TimerModel, GuildConfig, GuildBlocklist, FeaturedChannel, FeaturedEvent, FeaturedThread, FeaturedMessage } = require("../Mongoose/Models");

module.exports = {

    /**
     * Removes everything connected to a Guild from the DB on leaving said Guild
     * 
     * @param {String} guildId 
     * @param {?Boolean} skipBlockList ONLY INCLUDE if resetting and not because of leaving Guild
     */
    async removeGuild(guildId, skipBlockList)
    {
        // Check for entries
        let hasTimers = await TimerModel.exists({ guildId: guildId });
        let hasConfig = await GuildConfig.exists({ guildId: guildId });
        let hasBlockList = await GuildBlocklist.exists({ guildId: guildId });
        let hasChannel = await FeaturedChannel.exists({ guildId: guildId });
        let hasEvent = await FeaturedEvent.exists({ guildId: guildId });
        let hasThread = await FeaturedThread.exists({ guildId: guildId });
        let hasMessage = await FeaturedMessage.exists({ guildId: guildId });


        // Purge if true
        if ( hasTimers != null ) { await TimerModel.deleteMany({ guildId: guildId }); }
        if ( hasConfig != null ) { await GuildConfig.deleteMany({ guildId: guildId }); }
        if ( hasBlockList != null && skipBlockList !== true ) { await GuildBlocklist.deleteMany({ guildId: guildId }); }
        if ( hasChannel != null ) { await FeaturedChannel.deleteMany({ guildId: guildId }); }
        if ( hasEvent != null ) { await FeaturedEvent.deleteMany({ guildId: guildId }); }
        if ( hasThread != null ) { await FeaturedThread.deleteMany({ guildId: guildId }); }
        if ( hasMessage != null ) { await FeaturedMessage.deleteMany({ guildId: guildId }); }

        return;
    }

}
