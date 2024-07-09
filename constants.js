const { Client, Options, GatewayIntentBits, Collection, Partials, User, GuildMember } = require("discord.js");

// User IDs for HomeCord and my Testing Bot just to prevent them from being removed from caches
let homecordUserId = [ "795718481873469500", "784058687412633601" ];

module.exports =
{
    // Discord Client representing the Bot/App
    DiscordClient: new Client({
        intents: [
            GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildScheduledEvents
        ],
        partials: [ Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User ],
        // For performance. Numbers are in seconds
        sweepers: {
            ...Options.DefaultSweeperSettings,
            messages: { interval: 3_600, lifetime: 1_800 },
            users: {
                interval: 3_600,
                filter: () => user => !homecordUserId.includes(user.id)
            },
            guildMembers: {
                interval: 3_600,
                filter: () => member => !homecordUserId.includes(member.id)
            },
            threadMembers: {
                interval: 3_600,
                filter: () => member => !homecordUserId.includes(member.id)
            },
            threads: { interval: 3_600, lifetime: 1_800 }
        }
    }),

    // Collections that are used in many locations
    Collections: {
        TextCommands: new Collection(),
        SlashCommands: new Collection(),
        ContextCommands: new Collection(),
        Buttons: new Collection(),
        Selects: new Collection(),
        Modals: new Collection(),

        TextCooldowns: new Collection(),
        SlashCooldowns: new Collection(),
        ContextCooldowns: new Collection(),
        ButtonCooldowns: new Collection(),
        SelectCooldowns: new Collection()
    },


    /**
     * Checks the Tag/Discrim of the given User object, to see if they're on the new Username system or not
     * @param {User} user User object to check
     * 
     * @returns {Boolean} True if on the new Username system
     */
    checkPomelo(user)
    {
        if ( user.discriminator === "0" ) { return true; }
        else { return false; }
    },


    /**
     * Fetches the highest-level Display Name for the provided User or Member
     * @param {User|GuildMember} userMember User or Member object
     * @param {Boolean?} skipNicknames Set to True to skip Server Nicknames
     * 
     * @returns {String} The Username, Display Name or Nickname of the User/Member Object - whichever's highest
     */
    fetchDisplayName(userMember, skipNicknames)
    {
        let highestName = "";
        let isPomelo = false;
        if ( (userMember instanceof GuildMember) && userMember.user.discriminator === "0" ) { isPomelo = true; }
        if ( (userMember instanceof User) && userMember.discriminator === "0" ) { isPomelo = true; }

        // Usernames
        highestName = userMember instanceof GuildMember ? `@${userMember.user.username}${isPomelo ? "" : `#${userMember.user.discriminator}`}`
            : `@${userMember.username}${isPomelo ? "" : `#${userMember.discriminator}`}`;
        
        // Display Names
        if ( (userMember instanceof User) && (userMember.globalName != null) ) { highestName = userMember.globalName; }
        if ( (userMember instanceof GuildMember) && (userMember.user.globalName != null) ) { highestName = userMember.user.globalName; }

        // Server Nicknames
        if ( !skipNicknames && (userMember instanceof GuildMember) && (userMember.nickname != null) ) { highestName = userMember.nickname; }

        return highestName;
    }
}
