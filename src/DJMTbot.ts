import Discord, {
    Client,
    GuildMember, Intents,
    Message,
    User,
    VoiceState
} from "discord.js";
import {promises as FileSystem} from "fs";
import {DJMTGuild} from "./DJMTGuild";
import {Cron} from "./Cron";
// Here we load the guildConfigs.json file that contains our token and our prefix values.
require('dotenv').config();
Cron.getInstance();

export class DJMTbot {
    private static instance: DJMTbot;
    client: Client;
    guilds: Map<string, DJMTGuild>;
    private constructor() {
        this.client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS],
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
        this.guilds = new Map<string, DJMTGuild>();
        this.initGuildInstancesFromFiles().then(r => console.log(`${this.guilds.size} DJMT Guilds Initialized`));
    }

    public static getInstance(): DJMTbot {
        if (!DJMTbot.instance) {
            DJMTbot.instance = new DJMTbot();
        }
        return DJMTbot.instance;
    }

    private async initGuildInstancesFromFiles(): Promise<void> {
        const filenames = await FileSystem.readdir('./json/guilds');
        const guildIds = filenames.map((filename) => filename.substr(0, filename.indexOf('.')));
        for (const id of guildIds) {
            const guild = new DJMTGuild(id);
            this.guilds.set(id, guild);
        }
    }

    async run() {
        this.client.on("ready", async () => {
            // Make guild instances for guilds we didnt have a file for
            for (let cachedGuild of [...this.client.guilds.cache.values()]) {
                const guildId = cachedGuild.id;
                if (!this.guilds.get(guildId)) {
                    const guild = new DJMTGuild(guildId);
                    this.guilds.set(guildId, guild);
                }
            }
            this.client?.user?.setActivity(`@DJMTbot for help!`);
            for (const id of Array.from(this.guilds.keys())) {
                await this.guilds.get(id)?.onReady();
            }
            console.log(`DJMTbot is ready!`);
        });

        this.client.on('guildMemberAdd', async (member) => {
            const guild = this.guilds.get(member.guild?.id || '');
            if (guild) {
                await guild.onGuildMemberAdd(member as GuildMember);
            } else {
                console.log(`member does not have an associated guild instance: ${member}`)
            }
        });

        this.client.on("messageCreate", async (message: Message) => {
            if (message.author.bot) return; // Ignore bot messages
            let args: string[] = message.content.trim().split(/ +/g);
            const guild = this.guilds.get(message.guild?.id || '');
            if (guild) {
                await guild.onMessageCreate(args, message);
            } else {
                console.log(`Message does not have an associated guild instance: ${message}`)
            }
        });

        this.client.on("messageUpdate", async (oldMessage, newMessage) => {
            const guild = this.guilds.get(newMessage.guild?.id || '');
            if (guild) {
                await guild.onMessageUpdate(oldMessage as Message, newMessage as Message);
            } else {
                console.log(`NewMessage does not have an associated guild instance: ${newMessage}`)
            }
        })

        this.client.on("voiceStateUpdate", async (oldState, newState) => {
            const guild = this.guilds.get(newState.guild?.id || '');
            if (guild) {
                await guild.onVoiceStateUpdate(oldState as VoiceState, newState as VoiceState);
            } else {
                console.log(`newState does not have an associated guild instance: ${newState}`)
            }
        })

        this.client.on('messageReactionAdd', async (messageReaction, user) => {
            // When we receive a reaction we check if the reaction is partial or not
            if (messageReaction.partial) {
                // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
                try {
                    await messageReaction.fetch();
                } catch (error) {
                    console.error('Something went wrong when fetching the message: ', error);
                    return;
                }
            }
            const guild = this.guilds.get(messageReaction.message.guild?.id || '');
            if (!messageReaction.partial && guild) {
                await guild.onMessageReactionAdd(messageReaction, user as User);
            } else {
                console.log(`Reaction does not have an associated guild instance: ${messageReaction}`)
            }
        });

        this.client.on("messageReactionRemove", async (messageReaction, user) => {
            // When we receive a reaction we check if the reaction is partial or not
            if (messageReaction.partial) {
                // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
                try {
                    await messageReaction.fetch();
                } catch (error) {
                    console.error('Something went wrong when fetching the message: ', error);
                    return;
                }
            }
            const guild = this.guilds.get(messageReaction.message.guild?.id || '');
            if (!messageReaction.partial && guild) {
                await guild.onMessageReactionRemove(messageReaction, user as User);
            } else {
                console.log(`Reaction does not have an associated guild instance: ${messageReaction}`)
            }
        });

        this.client.on("guildCreate", guild => {
            console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
        });

        this.client.on("guildDelete", guild => {
            console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
        });

        await this.client.login(process.env.TOKEN);
    }
}
