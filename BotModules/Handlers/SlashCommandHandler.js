const { ChatInputCommandInteraction, ApplicationCommandOptionType, DMChannel, Collection } = require("discord.js");
const { Collections } = require("../../constants.js");
const { localize } = require("../LocalizationModule.js");

module.exports = {
    /**
     * Handles and runs received Slash Commands
     * @param {ChatInputCommandInteraction} slashInteraction 
     */
    async Main(slashInteraction)
    {
        const SlashCommand = Collections.SlashCommands.get(slashInteraction.commandName);

        if ( !SlashCommand )
        {
            // Couldn't find the file for this Slash Command
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
        }

        // Checks for SubCommand or SubCommand-Groups, so that they can have their own Cooldowns
        const SubcommandCheck = slashInteraction.options.data.find(cmd => cmd.type === ApplicationCommandOptionType.Subcommand);
        const SubcommandGroupCheck = slashInteraction.options.data.find(cmd => cmd.type === ApplicationCommandOptionType.SubcommandGroup);
        if ( SubcommandGroupCheck != undefined ) { return await this.SubcommandGroup(slashInteraction, SlashCommand); }
        if ( SubcommandCheck != undefined ) { return await this.Subcommand(slashInteraction, SlashCommand); }

        // DM Check
        if ( SlashCommand.Scope === 'DM' && !(slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GUILDS_UNSUPPORTED')}` });
        }

        // Guild Check
        if ( SlashCommand.Scope === 'GUILD' && (slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_DMS_UNSUPPORTED')}` });
        }



        // Slash Command Cooldowns
        if ( !Collections.SlashCooldowns.has(SlashCommand.Name) )
        {
            // No active Cooldowns found, create new one
            Collections.SlashCooldowns.set(SlashCommand.Name, new Collection());
        }

        // Set initial values
        const Now = Date.now();
        /** @type {Collection} */
        const Timestamps = Collections.SlashCooldowns.get(SlashCommand.Name);
        const CooldownAmount = ( SlashCommand.Cooldown || 3 ) * 1000;

        // Cooldown
        if ( Timestamps.has(slashInteraction.user.id) )
        {
            // Cooldown hit, tell User to cool off a little bit
            const ExpirationTime = Timestamps.get(slashInteraction.user.id) + CooldownAmount;

            if ( Now < ExpirationTime )
            {
                let timeLeft = ( ExpirationTime - Now ) / 1000; // How much time is left of cooldown, in seconds

                // MINUTES
                if ( timeLeft >= 60 && timeLeft < 3600 )
                {
                    timeLeft = timeLeft / 60; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MINUTES', timeLeft.toFixed(1)) });
                    return;
                }
                // HOURS
                else if ( timeLeft >= 3600 && timeLeft < 86400 )
                {
                    timeLeft = timeLeft / 3600; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_HOURS', timeLeft.toFixed(1)) });
                    return;
                }
                // DAYS
                else if ( timeLeft >= 86400 && timeLeft < 2.628e+6 )
                {
                    timeLeft = timeLeft / 86400; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_DAYS', timeLeft.toFixed(1)) });
                    return;
                }
                // MONTHS
                else if ( timeLeft >= 2.628e+6 )
                {
                    timeLeft = timeLeft / 2.628e+6; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MONTHS', timeLeft.toFixed(1)) });
                    return;
                }
                // SECONDS
                else
                {
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_SECONDS', timeLeft.toFixed(1)) });
                    return;
                }
            }
        }
        else
        {
            // Create new cooldown
            Timestamps.set(slashInteraction.user.id, Now);
            setTimeout(() => Timestamps.delete(slashInteraction.user.id), CooldownAmount);
        }



        // Attempt to run Command
        try { await SlashCommand.execute(slashInteraction); }
        catch (err)
        {
            //console.error(err);
            if ( slashInteraction.deferred )
            {
                await slashInteraction.editReply({ content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
            else
            {
                await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
        }

        return;
    },



    /**
     * Handles and runs received Slash Commands, when a Subcommand is used
     * @param {ChatInputCommandInteraction} slashInteraction 
     * @param {*} SlashCommand File with Slash Command's data
     */
    async Subcommand(slashInteraction, SlashCommand)
    { 
        // Grab data
        const SubcommandName = slashInteraction.options.getSubcommand();
        const CombinedName = `${slashInteraction.commandName}_${SubcommandName}`;

        // DM Check
        if ( SlashCommand.SubcommandScope[SubcommandName] === 'DM' && !(slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GUILDS_UNSUPPORTED')}` });
        }
 
        // Guild Check
        if ( SlashCommand.SubcommandScope[SubcommandName] === 'GUILD' && (slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_DMS_UNSUPPORTED')}` });
        }
 
 
 
        // Slash Command Cooldowns
        if ( !Collections.SlashCooldowns.has(CombinedName) )
        {
            // No active Cooldowns found, create new one
            Collections.SlashCooldowns.set(CombinedName, new Collection());
        }
 
        // Set initial values
        const Now = Date.now();
        /** @type {Collection} */
        const Timestamps = Collections.SlashCooldowns.get(CombinedName);
        const CooldownAmount = ( SlashCommand.SubcommandCooldown[SubcommandName] || 3 ) * 1000;
 
        // Cooldown
        if ( Timestamps.has(slashInteraction.user.id) )
        {
            // Cooldown hit, tell User to cool off a little bit
            const ExpirationTime = Timestamps.get(slashInteraction.user.id) + CooldownAmount;
 
            if ( Now < ExpirationTime )
            {
                let timeLeft = ( ExpirationTime - Now ) / 1000; // How much time is left of cooldown, in seconds
 
                // MINUTES
                if ( timeLeft >= 60 && timeLeft < 3600 )
                {
                    timeLeft = timeLeft / 60; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MINUTES', timeLeft.toFixed(1)) });
                    return;
                }
                // HOURS
                else if ( timeLeft >= 3600 && timeLeft < 86400 )
                {
                    timeLeft = timeLeft / 3600; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_HOURS', timeLeft.toFixed(1)) });
                    return;
                }
                // DAYS
                else if ( timeLeft >= 86400 && timeLeft < 2.628e+6 )
                {
                    timeLeft = timeLeft / 86400; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_DAYS', timeLeft.toFixed(1)) });
                    return;
                }
                // MONTHS
                else if ( timeLeft >= 2.628e+6 )
                {
                    timeLeft = timeLeft / 2.628e+6; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MONTHS', timeLeft.toFixed(1)) });
                    return;
                }
                // SECONDS
                else
                {
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_SECONDS', timeLeft.toFixed(1)) });
                    return;
                }
            }
        }
        else
        {
            // Create new cooldown
            Timestamps.set(slashInteraction.user.id, Now);
            setTimeout(() => Timestamps.delete(slashInteraction.user.id), CooldownAmount);
        }
 
 
 
        // Attempt to run Command
        try { await SlashCommand.execute(slashInteraction); }
        catch (err)
        {
            //console.error(err);
            if ( slashInteraction.deferred )
            {
                await slashInteraction.editReply({ content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
            else
            {
                await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
        }
 
        return;
    },



    /**
     * Handles and runs received Slash Commands, when a Subcommand Group is used
     * @param {ChatInputCommandInteraction} slashInteraction 
     * @param {*} SlashCommand File with Slash Command's data
     */
    async SubcommandGroup(slashInteraction, SlashCommand)
    { 
        // Grab data
        const SubcommandGroupName = slashInteraction.options.getSubcommandGroup();
        const SubcommandName = slashInteraction.options.getSubcommand();
        const CombinedSubcommandName = `${SubcommandGroupName}_${SubcommandName}`;
        const CombinedName = `${slashInteraction.commandName}_${SubcommandGroupName}_${SubcommandName}`;

        // DM Check
        if ( SlashCommand.SubcommandScope[CombinedSubcommandName] === 'DM' && !(slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GUILDS_UNSUPPORTED')}` });
        }
 
        // Guild Check
        if ( SlashCommand.SubcommandScope[CombinedSubcommandName] === 'GUILD' && (slashInteraction.channel instanceof DMChannel) )
        {
            return await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_DMS_UNSUPPORTED')}` });
        }
 
 
 
        // Slash Command Cooldowns
        if ( !Collections.SlashCooldowns.has(CombinedName) )
        {
            // No active Cooldowns found, create new one
            Collections.SlashCooldowns.set(CombinedName, new Collection());
        }
 
        // Set initial values
        const Now = Date.now();
        /** @type {Collection} */
        const Timestamps = Collections.SlashCooldowns.get(CombinedName);
        const CooldownAmount = ( SlashCommand.SubcommandCooldown[CombinedSubcommandName] || 3 ) * 1000;
 
        // Cooldown
        if ( Timestamps.has(slashInteraction.user.id) )
        {
            // Cooldown hit, tell User to cool off a little bit
            const ExpirationTime = Timestamps.get(slashInteraction.user.id) + CooldownAmount;
 
            if ( Now < ExpirationTime )
            {
                let timeLeft = ( ExpirationTime - Now ) / 1000; // How much time is left of cooldown, in seconds
 
                // MINUTES
                if ( timeLeft >= 60 && timeLeft < 3600 )
                {
                    timeLeft = timeLeft / 60; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MINUTES', timeLeft.toFixed(1)) });
                    return;
                }
                // HOURS
                else if ( timeLeft >= 3600 && timeLeft < 86400 )
                {
                    timeLeft = timeLeft / 3600; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_HOURS', timeLeft.toFixed(1)) });
                    return;
                }
                // DAYS
                else if ( timeLeft >= 86400 && timeLeft < 2.628e+6 )
                {
                    timeLeft = timeLeft / 86400; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_DAYS', timeLeft.toFixed(1)) });
                    return;
                }
                // MONTHS
                else if ( timeLeft >= 2.628e+6 )
                {
                    timeLeft = timeLeft / 2.628e+6; // For UX
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_MONTHS', timeLeft.toFixed(1)) });
                    return;
                }
                // SECONDS
                else
                {
                    await slashInteraction.reply({ ephemeral: true, content: localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_COOLDOWN_SECONDS', timeLeft.toFixed(1)) });
                    return;
                }
            }
        }
        else
        {
            // Create new cooldown
            Timestamps.set(slashInteraction.user.id, Now);
            setTimeout(() => Timestamps.delete(slashInteraction.user.id), CooldownAmount);
        }
 
 
 
        // Attempt to run Command
        try { await SlashCommand.execute(slashInteraction); }
        catch (err)
        {
            //console.error(err);
            if ( slashInteraction.deferred )
            {
                await slashInteraction.editReply({ content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
            else
            {
                await slashInteraction.reply({ ephemeral: true, content: `${localize(slashInteraction.locale, 'SLASH_COMMAND_ERROR_GENERIC')}` });
            }
        }
 
        return;
    }
}
