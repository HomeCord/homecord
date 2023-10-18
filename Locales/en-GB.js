module.exports = {
    // ******* GENERIC STUFF
    ERROR_GENERIC: `An error has occurred.`,



    // ******* FOR HOMECORD DESCRIPTIONS, ETC
    HECCBOT_DESCRIPTION_SHORT: `HomeCord shows your Server's current activity in a custom-made Home Channel! You can also feature Channels, Events, Messages, and more with HomeCord.`,
    HECCBOT_DESCRIPTION_LONG: `HomeCord allows you to feature activity from your Server in a custom-made Home Channel! Supports featuring or highlighting Channels, Events, Messages, Voice, and Stages. Use {{0}} for more information, or {{1}} to begin setting up HomeCord in your Server!`,



    // ******* GENERIC SLASH COMMAND STUFF
    SLASH_COMMAND_ERROR_GENERIC: `Sorry, but there was a problem trying to run this Slash Command...`,
    SLASH_COMMAND_ERROR_GUILDS_UNSUPPORTED: `Sorry, but this Slash Command can only be used in Direct Messages (DMs) with me.`,
    SLASH_COMMAND_ERROR_DMS_UNSUPPORTED: `Sorry, but this Slash Command cannot be used within Direct Messages (DMs) or Group DMs.`,
    SLASH_COMMAND_ERROR_HECCBOT_DMS_UNSUPPORTED: `Sorry, but this Slash Command can only be used in Servers, not in Direct Messages (DMs) with me.`,
    SLASH_COMMAND_ERROR_ONLY_TEXT_CHANNELS: `Sorry, but this Slash Command can only be used inside of Server Text Channels.`,
    SLASH_COMMAND_ERROR_DISCORD_OUTAGE: `Sorry, but this Command is unusable while there's a Discord Outage affecting your Server. You can check [Discord's Outage Page](https://discordstatus.com) for extra details.`,

    SLASH_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Slash Command again.`,



    // ******* GENERIC CONTEXT COMMAND STUFF
    CONTEXT_COMMAND_ERROR_GENERIC: `Sorry, an error occurred while trying to run this Context Command...`,
    CONTEXT_COMMAND_ERROR_DMS_UNSUPPORTED: `Sorry, but this Context Command cannot be used within Direct Messages (DMs) or Group DMs.`,
    CONTEXT_COMMAND_ERROR_SYSTEM_AND_BOT_MESSAGES_UNSUPPORTED: `Sorry, but this Context Command cannot be used on a System or Bot Message.`,
    CONTEXT_COMMAND_ERROR_GUILDS_UNSUPPORTED: `Sorry, but this Context Command can only be used in Direct Messages (DMs) with me.`,
    CONTEXT_COMMAND_ERROR_DMS_UNSUPPORTED: `Sorry, but this Context Command cannot be used within Direct Messages (DMs) or Group DMs.`,
    CONTEXT_COMMAND_ERROR_HECCBOT_DMS_UNSUPPORTED: `Sorry, but this Context Command can only be used in Servers, not in Direct Messages (DMs) with me.`,

    CONTEXT_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Context Command again.`,



    // ******* GENERIC BUTTON STUFF
    BUTTON_ERROR_GENERIC: `An error occurred while trying to process that Button press...`,

    BUTTON_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Button again.`,



    // ******* GENERIC SELECT MENU STUFF
    SELECT_MENU_ERROR_GENERIC: `An error occurred while trying to process that Select Menu choice...`,

    SELECT_MENU_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Select Menu again.`,
    SELECT_MENU_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Select Menu again.`,
    SELECT_MENU_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Select Menu again.`,
    SELECT_MENU_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Select Menu again.`,
    SELECT_MENU_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Select Menu again.`,



    // ******* GENERIC MODAL STUFF
    MODAL_ERROR_GENERIC: `An error occurred while trying to process that Modal submission...`,



    // ******* GENERIC AUTOCOMPLETE STUFF
    AUTOCOMPLETE_ERROR_GENERIC: `Error: Unable to process. Please contact this Bot's developer!`,



    // ******* GENERIC HOMECORD STUFF
    TRUE_UPPERCASE: `TRUE`,
    FALSE_UPPERCASE: `FALSE`,
    TRUE: `True`,
    FALSE: `False`,

    VERY_LOW_UPPERCASE: `VERY LOW`,
    LOW_UPPERCASE: `LOW`,
    MEDIUM_UPPERCASE: `MEDIUM`,
    HIGH_UPPERCASE: `HIGH`,
    VERY_HIGH_UPPERCASE: `VERY HIGH`,
    VERY_LOW: `Very Low`,
    LOW: `Low`,
    MEDIUM: `Medium`,
    HIGH: `High`,
    VERY_HIGH: `Very High`,

    PLEASE_SELECT_AN_OPTION: `Please select an option`,



    // ******* SETUP COMMAND
    SETUP_COMMAND_CANCEL_SETUP: `Cancelled setup of Home Channel. Feel free to delete or dismiss this message.`,

    SETUP_COMMAND_ERROR_HOME_ALREADY_SETUP: `You cannot use this Command when this Server already has a Home Channel setup!`,
    SETUP_COMMAND_ERROR_MISSING_MANAGE_CHANNELS_PERMISSION: `Sorry, but I cannot create your Home Channel without the **Manage Channels** Permission. Please grant me that Permission in Server Settings > Roles!\n*(You can revoke this Permission from me after your Home Channel has been setup)*`,
    SETUP_COMMAND_ERROR_MISSING_MANAGE_WEBHOOKS_PERMISSION: `Sorry, but I cannot setup your Home Channel without the **Manage Webhooks** Permission. Please grant me that Permission in Server Settings > Roles!\n*(You can revoke this Permission from me after your Home Channel has been setup)*`,



    // ******* SETUP EMBED
    SETUP_EMBED_TITLE: `Home Channel Setup`,
    SETUP_EMBED_DESCRIPTION: `Please configure your Home Channel to how you would like it.\nOnce it's configured, select "Save & Create" in order to fully create your Home Channel!`,
    SETUP_EMBED_CHANNEL: `Channel to use for Home`,
    CREATE_CHANNEL_FOR_ME: `Create Channel for me`,
    SETUP_EMBED_ACTIVITY_THRESHOLD: `Activity Threshold`,
    SETUP_EMBED_HIGHLIGHT_MESSAGES: `Highlight Messages`,
    SETUP_EMBED_HIGHLIGHT_SCHEDULED_EVENTS: `Highlight Scheduled Events`,
    SETUP_EMBED_HIGHLIGHT_VOICE_ACTIVITY: `Highlight Voice Activity`,
    SETUP_EMBED_HIGHLIGHT_LIVE_STAGES: `Highlight Live Stages`,
    SETUP_EMBED_HIGHLIGHT_ACTIVE_THREADS: `Highlight Active Threads & Posts`,
    SETUP_EMBED_FOOTER_STEP_ONE: `Setup - Step 1 of 3`, // Configure Settings
    SETUP_EMBED_FOOTER_STEP_TWO: `Setup - Step 2 of 3`, // Validate Permissions
    SETUP_EMBED_FOOTER_STEP_THREE: `Setup - Step 3 of 3`, // Create & Setup "Home" Channel



    // ******* SETUP SELECT
    SETUP_SELECT_CHANNEL: `Set Channel`,
    SETUP_SELECT_LABEL_ACTIVITY: `Set Activity Threshold`,
    SETUP_SELECT_LABEL_MESSAGES: `Set Message Highlighting`,
    SETUP_SELECT_LABEL_EVENTS: `Set Events Highlighting`,
    SETUP_SELECT_LABEL_VOICE: `Set Voice Highlighting`,
    SETUP_SELECT_LABEL_STAGES: `Set Stages Highlighting`,
    SETUP_SELECT_LABEL_THREADS: `Set Threads Highlighting`,
    SETUP_SELECT_LABEL_SAVE_AND_CREATE: `Save & Create`,
    SETUP_SELECT_LABEL_CANCEL: `Cancel Setup`,

    SETUP_EMBED_CHANNEL_DESCRIPTION: `Set which Channel to use for your Home Channel`,
    SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD: `Set the minimum Activity Threshold`,
    SETUP_SELECT_TOGGLE_MESSAGES: `Toggle if Messages can be highlighted`,
    SETUP_SELECT_TOGGLE_EVENTS: `Toggle if Scheduled Events can be highlighted`,
    SETUP_SELECT_TOGGLE_VOICE: `Toggle if Voice Channels can be highlighted`,
    SETUP_SELECT_TOGGLE_STAGES: `Toggle if live Stages can be highlighted`,
    SETUP_SELECT_TOGGLE_THREADS: `Toggle if Threads and Forum Posts can be highlighted`,
    SETUP_SELECT_SAVE: `Save the settings and create your Home Channel`,
    SETUP_SELECT_CANCEL: `Cancel setup of your Home Channel`,



    // ******* SETUP - SET CHANNEL
    SETUP_SET_CHANNEL_SELECT_PLACEHOLDER: `Search for an existing Channel`,
    SETUP_CREATE_CHANNEL_BUTTON_LABEL: `Create for me`,
    SETUP_SET_CHANNEL_EMBED_TITLE: `Set Home Channel Location`,
    SETUP_SET_CHANNEL_EMBED_DESCRIPTION: `Please set where you would like your Home Channel to be.\n\nIf you want to use an existing Text Channel, select it using the Channel Select Menu below.\n\nOtherwise, please tap the "Create for me" Button if you want HomeCord to create your Home Channel for you.`,
    
    SETUP_SET_CHANNEL_ERROR_INVALID_CHANNEL_TYPE: `Selected Channel was not a Text Channel. Please select a Text Channel (not any other Channel Type).`,



    // ******* SETUP - SET ACTIVITY THRESHOLD
    SETUP_SET_ACTIVITY_EMBED_TITLE: `Set Activity Threshold`,
    SETUP_SET_ACTIVITY_EMBED_DESCRIPTION: `Please select which Activity Threshold you would like for your Home Channel.\n\nThe Activity Threshold is the minimum amount of activity any Message, Event, Voice Channel, Forum Post, or Thread should reach before it can be highlighted (if enabled) in your Home Channel.\n\n- For smaller or less active Servers, "Very Low" or "Low" may be best for you.\n- For large public Servers, it may be best to select "Medium" or "High", depending on how much daily activity you see.`,
};
