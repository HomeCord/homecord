module.exports = {
    // ******* GENERIC STUFF
    ERROR_GENERIC: `An error has occurred.`,
    ERROR_WITH_PREVIEW: `An error has occurred. A preview of the raw error is as follows:\n\`\`\`{{0}}\`\`\``,



    // ******* FOR HOMECORD DESCRIPTIONS, ETC
    HOMECORD_DESCRIPTION_SHORT: `HomeCord shows your Server's current activity in a custom-made Home Channel! You can also feature Channels, Events, Messages, and more with HomeCord.`,
    HOMECORD_DESCRIPTION_LONG: `HomeCord allows you to feature activity from your Server in a custom-made Home Channel! Supports featuring or highlighting Channels, Events, Messages, Threads, Forum/Media Posts, Voice, and Stages. Use {{0}} for more information, or {{1}} to begin setting up HomeCord in your Server!`,



    // ******* GENERIC SLASH COMMAND STUFF
    SLASH_COMMAND_ERROR_GENERIC: `Sorry, but there was a problem trying to run this Slash Command...`,
    SLASH_COMMAND_ERROR_GUILDS_UNSUPPORTED: `Sorry, but this Slash Command can only be used in Direct Messages (DMs) with me.`,
    SLASH_COMMAND_ERROR_DMS_UNSUPPORTED: `Sorry, but this Slash Command cannot be used within Direct Messages (DMs) or Group DMs.`,
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

    ENABLE: `Enable`,
    DISABLE: `Disable`,

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



    // ******* FOR HOME CHANNEL ITSELF
    HOME_CHANNEL_NAME: `home`,
    HOME_CHANNEL_DESCRIPTION: `See a summary of highlighted Server activity in this Home Channel, powered by the HomeCord Bot!`,

    HOME_TITLE: `# {{0}} - Home Channel`,
    HOME_EMPTY: `*There doesn't seem to be anything highlighted...*\n*Maybe you can help by starting a conversation in this Server's Channels!*`,
    HOME_SUBHEADING: `*A summary and showcase of this Server's activity and events!*\n*Nothing displayed? Maybe you can help by starting a conversation in this Server's Channels!*`,

    HOME_FEATURED_CHANNELS_HEADER: `## Featured Channels\nChannels featured by this Server's Admins. You might want to check these out!\n*Note: Channels displaying as "Unknown"? Simply tap their mentions to load their names again.*`,
    HOME_SCHEDULED_EVENTS_HEADER: `## Upcoming Scheduled Events\nHighlighted upcoming Events happening right here in this Server!\n*Note: You can see a full list of this Server's Scheduled Events in the Events Tab at the top of your Channel List.*`,
    HOME_ACTIVE_VOICE_HEADER: `## Active Voice Channels\nHighlighted active Voice Channels. Why not hop in and join the chaos?`,
    HOME_ACTIVE_THREADS_HEADER: `## Active Threads & Forum/Media Posts\nLooking for specific conversations? Maybe these active Threads or Forum/Media Posts hold the answer!\n*Note: Threads/Posts displaying as "Unknown"? Simply tap their mentions to load their names again.*`,
    HOME_FEATURED_MESSAGES_HEADER: `## Highlighted Messages\nNoteworthy Messages a lot of Server Members seem to like!`,

    HOME_FEATURED_EVENT_TAG: `Featured Event!`,
    HOME_FEATURED_POST_TAG: `Featured Post!`,
    HOME_FEATURED_THREAD_TAG: `Featured Thread!`,
    HOME_FEATURED_MESSAGE_TAG: `Featured Message`,
    HOME_ORIGINAL_MESSAGE_TAG: `Original Message`,

    HOME_ACTIVE_VOICE_MEMBERS: `{{0}} Active Members`,



    // ******* SETUP COMMAND
    SETUP_COMMAND_CANCEL_SETUP: `Cancelled setup of Home Channel. Feel free to delete or dismiss this message.`,

    SETUP_COMMAND_ERROR_HOME_ALREADY_SETUP: `You cannot use this Command when this Server already has a Home Channel setup!`,
    SETUP_COMMAND_ERROR_MISSING_MANAGE_CHANNELS_PERMISSION: `Sorry, but I cannot create your Home Channel without the **Manage Channels** Permission. Please grant me that Permission in Server Settings > Roles!\n*(You can revoke this Permission from me after your Home Channel has been setup)*`,
    SETUP_COMMAND_ERROR_MISSING_MANAGE_WEBHOOKS_PERMISSION: `Sorry, but I cannot setup your Home Channel without the **Manage Webhooks** Permission. Please grant me that Permission in Server Settings > Roles!\n*(You can revoke this Permission from me after your Home Channel has been setup)*`,



    // ******* SETUP EMBED
    SETUP_EMBED_TITLE: `Home Channel Setup - Settings`,
    SETUP_EMBED_DESCRIPTION: `Please configure your Home Channel to how you would like it.\nOnce it's configured, select "Save & Proceed" in order to fully create your Home Channel!`,
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
    SETUP_SELECT_LABEL_SAVE_AND_CREATE: `Save & Proceed`,
    SETUP_SELECT_LABEL_CANCEL: `Cancel Setup`,

    SETUP_EMBED_CHANNEL_DESCRIPTION: `Set which Channel to use for your Home Channel`,
    SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD: `Set the minimum Activity Threshold`,
    SETUP_SELECT_TOGGLE_MESSAGES: `Toggle if Messages can be highlighted`,
    SETUP_SELECT_TOGGLE_EVENTS: `Toggle if Scheduled Events can be highlighted`,
    SETUP_SELECT_TOGGLE_VOICE: `Toggle if active Voice Channels can be highlighted`,
    SETUP_SELECT_TOGGLE_STAGES: `Toggle if live Stages can be highlighted`,
    SETUP_SELECT_TOGGLE_THREADS: `Toggle if Threads and Forum/Media Posts can be highlighted`,
    SETUP_SELECT_SAVE: `Save the settings and proceeds to Step 2`,
    SETUP_SELECT_CANCEL: `Cancel setup of your Home Channel`,



    // ******* SETUP - SET CHANNEL
    SETUP_SET_CHANNEL_SELECT_PLACEHOLDER: `Search for an existing Channel`,
    SETUP_CREATE_CHANNEL_BUTTON_LABEL: `Create for me`,
    SETUP_SET_CHANNEL_EMBED_TITLE: `Set Home Channel Location`,
    SETUP_SET_CHANNEL_EMBED_DESCRIPTION: `Please set where you would like your Home Channel to be.\n\nIf you want to use an existing Text Channel, select it using the Channel Select Menu below. *(It's recommended to pick a read-only Channel that Server Members cannot send messages into)*\n\nOtherwise, please tap the "Create for me" Button if you want HomeCord to create your Home Channel for you.`,
    
    SETUP_SET_CHANNEL_ERROR_INVALID_CHANNEL_TYPE: `Selected Channel was not a Text Channel. Please select a Text Channel (not any other Channel Type).`,



    // ******* SETUP - SET ACTIVITY THRESHOLD
    SETUP_SET_ACTIVITY_EMBED_TITLE: `Set Activity Threshold`,
    SETUP_SET_ACTIVITY_EMBED_DESCRIPTION: `Please select which Activity Threshold you would like for your Home Channel.\n\nThe Activity Threshold is the minimum amount of activity any Message, Event, Voice Channel, Forum Post, or Thread should reach before it can be highlighted (if enabled) in your Home Channel.\n\n- For smaller or less active Servers, "Very Low" or "Low" may be best for you.\n- For large public Servers, it may be best to select "Medium" or "High", depending on how much daily activity you see.`,



    // ******* SETUP - TOGGLE HIGHLIGHTING STUFF
    SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_TITLE: `Toggle Highlighting Messages`,
    SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_DESCRIPTION: `Please set if you would like to enable or disable Messages being automatically highlighted on your Home Channel.\n\nPlease note: Disabling Message Highlights will **not** prevent you from manually featuring Messages onto your Home Channel.`,

    SETUP_TOGGLE_EVENT_HIGHLIGHTS_TITLE: `Toggle Highlighting Events`,
    SETUP_TOGGLE_EVENT_HIGHLIGHTS_DESCRIPTION: `Please set if you would like to enable or disable Scheduled Events being automatically highlighted on your Home Channel.\n\nPlease note: Disabling Event Highlights will **not** prevent you from manually featuring Scheduled Events onto your Home Channel.`,

    SETUP_TOGGLE_VOICE_HIGHLIGHTS_TITLE: `Toggle Highlighting Voice`,
    SETUP_TOGGLE_VOICE_HIGHLIGHTS_DESCRIPTION: `Please set if you would like to enable or disable active Voice Channels being automatically highlighted on your Home Channel.`,

    SETUP_TOGGLE_STAGE_HIGHLIGHTS_TITLE: `Toggle Highlighting Stages`,
    SETUP_TOGGLE_STAGE_HIGHLIGHTS_DESCRIPTION: `Please set if you would like to enable or disable live Stages being automatically highlighted on your Home Channel.`,

    SETUP_TOGGLE_THREAD_HIGHLIGHTS_TITLE: `Toggle Highlighting Threads/Posts`,
    SETUP_TOGGLE_THREAD_HIGHLIGHTS_DESCRIPTION: `Please set if you would like to enable or disable active Threads & Forum/Media Posts being automatically highlighted on your Home Channel.\n\nPlease note: Disabling Thread/Post Highlights will **not** prevent you from manually featuring Threads & Forum/Media Posts onto your Home Channel.`,



    // ******* SETUP - PAGE 2 - PROCESSING
    SETUP_PAGE_2_TITLE: `Home Channel Setup - Validation`,
    SETUP_PAGE_2_PROCESSING_DESCRIPTION: `*Validating Settings and checking Permissions...*`,
    SETUP_VALIDATION_SERVER_BASED: `*HomeCord will check for Permissions in Server Settings > Roles, since you selected to have HomeCord create a Home Channel for you.*`,
    SETUP_VALIDATION_CHANNEL_BASED: `*HomeCord will check for Permissions in {{0}}, the Text Channel you selected to be your Home Channel.*`,

    SETUP_VALIDATION_REQUIREMENTS: `Requirements`,
    SETUP_VALIDATION_REQUIREMENTS_DESCRIPTION: `*Required checks that need to be passed in order for HomeCord to correctly setup a Home Channel for your Server.*`,

    SETUP_MANAGE_CHANNELS_PERMISSION_MISSING: `:warning: Missing "**Manage Channels**" Permission *(Needed to create Home Channel for you)*`,
    SETUP_MANAGE_CHANNELS_PERMISSION_SUCCESS: `:white_check_mark: Has "**Manage Channels**" Permission *(For creating Home Channel for you)*`,

    SETUP_MANAGE_WEBHOOKS_PERMISSION_MISSING: `:warning: Missing "**Manage Webhooks**" Permission *(Needed to create a Webhook in Home Channel)*`,
    SETUP_MANAGE_WEBHOOKS_PERMISSION_SUCCESS: `:white_check_mark: Has "**Manage Webhooks**" Permission *(For creating a Webhook in Home Channel)*`,

    SETUP_SEND_MESSAGES_REVOKE_FAILED: `:warning: "**Send Messages**" Permission needs to be revoked for @everyone in Home Channel`,
    SETUP_SEND_MESSAGES_REVOKE_SUCCESS: `:white_check_mark: "**Send Messages**" Permission correctly revoked for @everyone in Home Channel`,

    SETUP_VALIDATION_SUGGESTIONS: `Suggestions`,
    SETUP_VALIDATION_SUGGESTIONS_DESCRIPTION: `*Optional extra things you may want to pass checks on to improve your Server's experience with HomeCord's Home Channel.\nIf a Permission is labelled as needing to be granted to @everyone, this is due to how Webhooks work on Discord. You can simply grant those Permissions in the Home Channel itself.*`,

    SETUP_EMBED_LINKS_PERMISSION_MISSING: `:information_source: Missing "**Embed Links**" Permission`,
    SETUP_EMBED_LINKS_PERMISSION_SUCCESS: `:white_check_mark: Has "**Embed Links**" Permission`,

    SETUP_ATTACH_FILES_PERMISSION_MISSING: `:information_source: Missing "**Attach Files**" Permission`,
    SETUP_ATTACH_FILES_PERMISSION_SUCCESS: `:white_check_mark: Has "**Attach Files**" Permission`,

    SETUP_EXTERNAL_EMOJIS_PERMISSION_MISSING: `:information_source: Missing "**Use External Emojis**" Permission (on @everyone)`,
    SETUP_EXTERNAL_EMOJIS_PERMISSION_SUCCESS: `:white_check_mark: Has "**Use External Emojis**" Permission (on @everyone)`,

    SETUP_CHANNEL_POSITION: `:information_source: It's recommended to have {{0}} at the top of the Channel List. *(Channel positions cannot be checked by HomeCord)*`,

    SETUP_STEP_2_SELECT_RECHECK: `Redo Validation`,
    SETUP_STEP_2_SELECT_RECHECK_DESCRIPTION: `Redo the Validation Checks for your setup`,
    SETUP_STEP_2_SELECT_CONFIRM: `Complete Setup`,
    SETUP_STEP_2_SELECT_CONFIRM_DESCRIPTION: `Finish setup of your Home Channel`,



    // ******* SETUP - STEP 3 - FINALIZING SETUP
    SETUP_PAGE_3_TITLE: `Home Channel Setup - Final Step`,
    SETUP_PAGE_3_DESCRIPTION: `*HomeCord is now setting up your Home Channel, this will take anywhere between a few seconds to a few minutes, depending on current rate-limits and Discord's API...*`,

    HOMECORD_WEBHOOK_NAME: `HomeCord`,
    HOMECORD_WEBHOOK_CREATION_REASON: `Home Channel Setup, via HomeCord's "/setup" Command used by {{0}}`,
    HOMECORD_CHANNEL_CREATION_REASON: `via HomeCord's "/setup" Command used by {{0}}`,

    SETUP_EXISTING_SUCCESSFUL: `Successfully setup your new Home Channel in {{0}}!\n\nFeel free to revoke the **Manage Webhooks** Permission from me as I no longer need it :)`,
    SETUP_CREATION_SUCCESSFUL: `Successfully setup your new Home Channel as {{0}}!\n\nFeel free to revoke the **Manage Channels** and **Manage Webhooks** Permissions from me as I no longer need them :)`,

    SETUP_SAVE_ERROR_GENERIC: `Sorry, but there was a problem trying to complete & save the setup of your new Home Channel.\nIf this continues, please feel free to contact HomeCord's Developer either via GitHub or HomeCord's Support Server (both linked in my \`/help\` Command).`,



    // ******* SETTINGS COMMAND
    SETTINGS_VIEW_EMBED_TITLE: `Current Home Settings for {{0}}`,
    SETTINGS_VIEW_EMBED_DESCRIPTION: `- *To edit these settings, use the {{0}} Command & include any of the provided options*\n- *Please note that currently you cannot change which Channel your Home is located in.*`,
    SETTINGS_VIEW_EMBED_HOME_CHANNEL: `Home Channel`,
    SETTINGS_VIEW_EMBED_ACTIVITY_THRESHOLD: `Activity Threshold`,
    SETTINGS_VIEW_EMBED_MESSAGES: `Messages Highlightable?`,
    SETTINGS_VIEW_EMBED_EVENTS: `Scheduled Events Highlightable?`,
    SETTINGS_VIEW_EMBED_VOICE: `Active Voice Highlightable?`,
    SETTINGS_VIEW_EMBED_STAGES: `Live Stages Highlightable?`,
    SETTINGS_VIEW_EMBED_THREADS: `Threads & Forum/Media Posts Highlightable?`,

    SETTINGS_EDIT_EMBED_TITLE: `Updated Home Settings for {{0}}`,
    SETTINGS_EDIT_EMBED_DESCRIPTION: `- *To view your current settings without changing them, use the {{0}} Command without including any of provided options.*`,

    SETTINGS_COMMAND_ERROR_HOME_NOT_SETUP: `This Server doesn't have a Home Channel setup using HomeCord. As such, there are no settings for you to view or edit!\nIf you want to setup a Home Channel using HomeCord, please use the {{0}} Command.`,



    // ******* PREFERENCES COMMAND
    PREFERENCES_VIEW_EMBED_TITLE: `Your Preferences for HomeCord`,
    PREFERENCES_VIEW_EMBED_DESCRIPTION: `- *To edit these preferences, use the {{0}} Command & include any of the provide options*`,
    PREFERENCES_VIEW_EMBED_HIGHLIGHTABLE: `Messages can be featured in Home Channels?`,

    PREFERENCES_EDIT_EMBED_TITLE: `Updated Preferences`,
    PREFERENCES_EDIT_EMBED_DESCRIPTION: `- *To view your current preferences without changing them, use the {{0}} Command without including any of the provided options.*`,



    // ******* FEATURE COMMAND - AUTOCOMPLETE OPTION(S)
    FEATURE_COMMAND_AUTOCOMPLETE_NO_EVENTS_FOUND: `No Scheduled Events found`,



    // ******* FEATURE COMMAND - SCHEDULED EVENTS
    FEATURE_COMMAND_EVENT_SUCCESS: "Successfully featured that Event on your Home Channel!",
    
    FEATURE_COMMAND_EVENT_ERROR_NO_EVENTS_FOUND: "Either HomeCord isn't able to see any of your Scheduled Events, or you don't have any in this Server to be featured on your Home Channel!",
    FEATURE_COMMAND_EVENT_ERROR_MAX_FEATURED_EVENTS: "Sorry, you cannot have more than 5 Events highlighted or featured on your Home Channel.",
    FEATURE_COMMAND_EVENT_ERROR_INVALID_INPUT: "Sorry, that doesn't seem to be a valid Event in this Server.\nPlease try again, ensuring you select an existing Event in this Server.",
    FEATURE_COMMAND_EVENT_ERROR_EVENT_ALREADY_FEATURED: "That Event is already being featured on your Home Channel!",
    FEATURE_COMMAND_EVENT_ERROR_GENERIC: "Sorry, an error occurred while trying to feature that Event to your Home Channel.",



    // ******* FEATURE COMMAND - CHANNELS   
    FEATURE_COMMAND_CHANNEL_SUCCESS: "Successfully featured {{0}} to your Home Channel!",
    
    FEATURE_COMMAND_CHANNEL_ERROR_MAX_FEATURED_CHANNELS: "Sorry, you cannot have more than 6 Channels featured to your Home Channel.",
    FEATURE_COMMAND_CHANNEL_ERROR_INVALID_INPUT: "Sorry, that doesn't seem to be a valid Channel in this Server.\nPlease try again, ensuring you select an existing Channel in this Server that HomeCord has \"View Permissions\" access to.",
    FEATURE_COMMAND_CHANNEL_ERROR_CHANNEL_ALREADY_FEATURED: "That Channel is already featured on your Home Channel!",
    FEATURE_COMMAND_CHANNEL_ERROR_CHANNEL_BLOCKED: `Sorry, this Channel cannot be featured as you have added it to your Block List.`,
    FEATURE_COMMAND_CHANNEL_ERROR_GENERIC: "Sorry, an error occurred while trying to feature {{0}} to your Home Channel.",



    // ******* FEATURE COMMAND - THREADS
    FEATURE_COMMAND_THREAD_SUCCESS: "Successfully featured that Thread/Post on your Home Channel!",
    
    FEATURE_COMMAND_THREAD_ERROR_MAX_FEATURED_THREADS: "Sorry, you cannot have more than 5 Threads/Posts highlighted or featured on your Home Channel.",
    FEATURE_COMMAND_THREAD_ERROR_INVALID_INPUT: "Sorry, that doesn't seem to be a valid Thread/Post in this Server.\nPlease try again, ensuring you select an existing Thread/Post in this Server.",
    FEATURE_COMMAND_THREAD_ERROR_THREAD_ALREADY_FEATURED: "That Thread/Post is already being featured on your Home Channel!",
    FEATURE_COMMAND_THREAD_ERROR_CHANNEL_BLOCKED: `Sorry, this Thread/Post cannot be featured as you have added its parent Channel to your Block List.`,
    FEATURE_COMMAND_THREAD_ERROR_GENERIC: "Sorry, an error occurred while trying to feature that Thread/Post to your Home Channel.",
};
