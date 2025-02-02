import {Channel, GuildMember, Message, MessageReaction, User, VoiceState} from "discord.js";
import {Component} from "../Component";
import {isAdmin} from "../HelperFunctions";
import {ComponentCommands} from "../Constants/ComponentCommands";
import {ComponentNames} from "../Constants/ComponentNames";

interface HelpComponentSave {}
export class HelpComponent extends Component<HelpComponentSave> {

    name: ComponentNames = ComponentNames.HELP;

    async onMessageCreateWithGuildPrefix(args: string[], message: Message): Promise<void> {
        const command = args?.shift()?.toLowerCase() || '';
        if (command === ComponentCommands.HELP) {
            await this.helpCmd(args, message);
        }
    }

    async getSaveData(): Promise<HelpComponentSave> {
        return {};
    }

    async afterLoadJSON(loadedObject: HelpComponentSave | undefined): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onReady(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onGuildMemberAdd(member: GuildMember): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onMessageCreate(args: string[], message: Message): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onMessageReactionAdd(messageReaction: MessageReaction, user: User): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onMessageReactionRemove(messageReaction: MessageReaction, user: User): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onMessageUpdate(oldMessage: Message, newMessage: Message): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
        return Promise.resolve(undefined);
    }

    async helpCmd(args: string[], message: Message) {
        let prefix = this.djmtGuild.prefix;
        let helpCommands =
            `#FUN
${prefix}cheems [text] -> Cheemsifies the given text.\n
${prefix}b [text] -> Applies b-speak to the given text.\n
${prefix}bruh -> Spits out a random message contained in marked bruh channels. Admins can mark channels to read from using the setbruh command.`;
        let helpAdminCommands =
            `#ADMIN ONLY
--------------------------------------------------------------------------------------
If the bot seems to not be responding, try using the resetconfig command (my bad ^^)
--------------------------------------------------------------------------------------
${prefix}prefix [text] -> Sets a new command prefix for this bot. Use this command without text to reset to the default: \`${process.env.DEFAULT_PREFIX}\`\n
${prefix}resetconfig -> Restores the guild's config settings to the bot's default config.\n
${prefix}exportconfig -> Returns the guild's config as a .txt.\n
${prefix}debug -> Toggles debug mode on.\n
${prefix}setdebugchannel -> Sets a debug channel to print debug info to.\n
${prefix}setstar [TextChannel Mention] ->  Marks/unmarks the mentioned channel(s) to be auto starred by the bot. Use command without mentioning channels to see the list of marked channels.\n`;
        let helpAdminCommands2 =
`${prefix}setautoreact [Emoji] [TextChannel Mention] ->  Marks/unmarks the mentioned channel(s) to be auto starred with the given emoji by the bot. Use command without mentioning channels to see the list of marked channels.\n
${prefix}setreactpairs [Emoji] [TextChannel Mention] [Threshold for ReactionBoard]->  Marks/unmarks the mentioned channel to be act as a starboard for the given emoji after threshold reacts is reached on a msg. Use command without mentioning channels to see the list of marked channels.\n
${prefix}setbruh [TextChannel Mention] ->  Marks/unmarks the mentioned channel(s) to be used by the bruh command. Use command without mentioning channels to see the list of marked channels.\n
${prefix}setdotw [TextChannel Mention] ->  Marks/unmarks the mentioned channel to get Day of the Week messages. Will send a message to the channel at 11:59 EST everyday (does not account for daylight savings). Use command without mentioning channels to see the list of marked channels.\n
${prefix}setvcpairs [VoiceChannelId] [TextChannel Mention] ->  Marks/unmarks the mentioned channels as a pair. Will send occasional reminder messages to the vc text channel. Use command without mentioning channels to see the list of marked channel pairs.\n
${prefix}setbanner [ImageUrl] ->  Adds an image to the banner images queue. Must be a url to a png or jpg image that is at least 960x540 pixels. Use command without a url to see the queue\n
${prefix}rotatebanner ->  Rotates the server banner to the next image in the queue \n
${prefix}setpngrc [TextChannel Mention] [width] [height] ->  Marks/unmarks the mentioned channel for PNG Resolution verification. Expects an integer width and integer height in pixels. Any images that arent pngs, or don't match the dimensions in the marked channel are deleted. \n
${prefix}sethours [VoiceChannelId] [TextChannelId] ->  Manually sets the hour count for a given vc text channel pair.\n\n`;

        if (isAdmin(message)) {
            await message.channel.send(`\`\`\`css\n${helpAdminCommands}\`\`\``);
            await message.channel.send(`\`\`\`css\n${helpAdminCommands2}\`\`\``);
        }
        await message.channel.send(`\`\`\`css\n${helpCommands}\`\`\``);
    }
}
