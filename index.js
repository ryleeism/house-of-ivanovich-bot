require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');

const { generateRegistry } = require('./generators/registryCard');

const fs = require('fs');
const path = require('path');

const OWNER_ID = '538561224183382016';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const DATA_PATH = './data.json';

function loadData() {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(
        DATA_PATH,
        JSON.stringify(data, null, 2)
    );
}

function toRoman(num) {

    const values = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];

    let result = "";

    for (const [value, numeral] of values) {
        while (num >= value) {
            result += numeral;
            num -= value;
        }
    }

    return result;
}

function formatHeir(rank, heir) {

    let status = '';

    if (heir.status === 'fallen') {
        status = ' ☠ FALLEN HEIR';
    }

    if (heir.status === 'exiled') {
        status = ' ⚰ EXILED HEIR';
    }

    return `⚔ ${rank}${getSuffix(rank)} ${heir.name}${status}`;
}

async function updateFamily(channel) {

    const data = loadData();

    const heirs = [
        ...data.heirs,
        ...data.reservedHeirs
    ];

    const pages = [];

    for (let i = 0; i < heirs.length; i += 20) {
        pages.push(
            heirs.slice(i, i + 20)
        );
    }

    if (pages.length === 0) {
        pages.push([]);
    }

    while (data.messageIds.length < pages.length) {

        const msg = await channel.send({
            content: 'Initializing House of Ivanovich...'
        });

        data.messageIds.push(msg.id);
    }

    saveData(data);

    for (let page = 0; page < pages.length; page++) {

        const logo =
            new AttachmentBuilder(
                path.join(
                    __dirname,
                    'assets',
                    'logo.png'
                )
            );

        const banner =
            new AttachmentBuilder(
                path.join(
                    __dirname,
                    'assets',
                    'banner.png'
                )
            );

        const heirText = heirs
    .map((heir, index) =>
        `${toRoman(index + 1)}. ${heir.name}`
    )
    .join('\n');

        const embed =
            new EmbedBuilder()
                .setColor('#D4AF37')
                .setTitle('⚜ 𝐇𝐎𝐔𝐒𝐄 𝐎𝐅 𝐈𝐕𝐀𝐍𝐎𝐕𝐈𝐂𝐇')
                .setThumbnail('attachment://logo.png')
                .setImage('attachment://banner.png')
                .setFooter({
                    text:
                        'We don\'t chase powers, we\'re born to rule.'
                });

        if (page === 0) {

            embed.setDescription(
`👑 **𝐓𝐇𝐄 𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍**
Rylee Celestia Ivanovich

━━━━━━━━━━━━━━━━━━

⚜ **𝐓𝐇𝐄 𝐇𝐄𝐈𝐑𝐒**

${heirText}`
);

        } else {

            embed.setDescription(
`⚜ **THE HEIRS (CONTINUED)**

${heirText}`
            );

        }

        const msg =
            await channel.messages.fetch(
                data.messageIds[page]
            );

        await msg.edit({
    content: '',
    embeds: [embed],
    files: [
        logo,
        banner
    ]
});

    }
}

client.once('clientReady', () => {

        console.log(
            `${client.user.tag} online`
        );

    }
);

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isChatInputCommand()
        ) return;

        if (
            interaction.user.id !== OWNER_ID
        ) {

            return interaction.reply({
                content:
                    '❌ Only The Sovereign may manage House Ivanovich.',
                ephemeral: true
            });

        }

        const data = loadData();

        if (
            interaction.commandName ===
            'setupfamily'
        ) {

            await updateFamily(
                interaction.channel
            );

            return interaction.reply({
                content:
                    '👑 House of Ivanovich established.',
                ephemeral: true
            });

        }

    if (interaction.commandName === 'testregistry') {

    const image = await generateRegistry(data);

    const attachment = new AttachmentBuilder(
        image,
        {
            name: 'registry.png'
        }
    );

    return interaction.reply({
        files: [attachment]
    });
}

if (interaction.commandName === 'removeheir') {

    const name =
        interaction.options.getString('name');

    data.heirs = data.heirs.filter(
        heir =>
            heir.name.toLowerCase() !==
            name.toLowerCase()
    );

    saveData(data);

    await updateFamily(
        interaction.channel
    );

    return interaction.reply({
        content: `🗑 Removed heir: ${name}`,
        ephemeral: true
    });

}

if (interaction.commandName === 'renameheir') {

    const oldName =
        interaction.options.getString('oldname');

    const newName =
        interaction.options.getString('newname');

    let heir =
        data.heirs.find(
            h =>
                h.name.toLowerCase() ===
                oldName.toLowerCase()
        );

    if (!heir) {

        heir =
            data.reservedHeirs.find(
                h =>
                    h.name.toLowerCase() ===
                    oldName.toLowerCase()
            );

    }

    if (!heir) {

        return interaction.reply({
            content: '❌ Heir not found.',
            ephemeral: true
        });

    }

    heir.name = newName;

    saveData(data);

    await updateFamily(
        interaction.channel
    );

    return interaction.reply({
        content:
            `✏️ Renamed heir to ${newName}`,
        ephemeral: true
    });

}

        if (
            interaction.commandName ===
            'addheir'
        ) {

            const name =
                interaction.options.getString(
                    'name'
                );

            data.heirs.push({
                name,
                status: 'active'
            });

            saveData(data);

            await updateFamily(
                interaction.channel
            );

            return interaction.reply({
                content:
                    `⚔ Added heir: ${name}`,
                ephemeral: true
            });

        }

        if (
            interaction.commandName ===
            'fallenheir'
        ) {

            const name =
                interaction.options.getString(
                    'name'
                );

            const heir =
                data.heirs.find(
                    h =>
                        h.name.toLowerCase() ===
                        name.toLowerCase()
                );

            if (heir) {
                heir.status = 'fallen';
            }

            saveData(data);

            await updateFamily(
                interaction.channel
            );

            return interaction.reply({
                content:
                    `☠ ${name} marked as Fallen Heir.`,
                ephemeral: true
            });

        }

        if (
            interaction.commandName ===
            'exileheir'
        ) {

            const name =
                interaction.options.getString(
                    'name'
                );

            const heir =
                data.heirs.find(
                    h =>
                        h.name.toLowerCase() ===
                        name.toLowerCase()
                );

            if (heir) {
                heir.status = 'exiled';
            }

            saveData(data);

            await updateFamily(
                interaction.channel
            );

            return interaction.reply({
                content:
                    `⚰ ${name} marked as Exiled Heir.`,
                ephemeral: true
            });

        }

        if (
            interaction.commandName ===
            'restoreheir'
        ) {

            const name =
                interaction.options.getString(
                    'name'
                );

            const heir =
                data.heirs.find(
                    h =>
                        h.name.toLowerCase() ===
                        name.toLowerCase()
                );

            if (heir) {
                heir.status = 'active';
            }

            saveData(data);

            await updateFamily(
                interaction.channel
            );

            return interaction.reply({
                content:
                    `👑 ${name} restored.`,
                ephemeral: true
            });

        }

    }
);

client.login(process.env.TOKEN);