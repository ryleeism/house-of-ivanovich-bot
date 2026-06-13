require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [

    new SlashCommandBuilder()
        .setName('setupfamily')
        .setDescription('Initialize House of Ivanovich'),

    new SlashCommandBuilder()
        .setName('addheir')
        .setDescription('Add a new heir')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Heir name')
                .setRequired(true)
        ),

new SlashCommandBuilder()
    .setName('renameheir')
    .setDescription('Rename an heir')
    .addStringOption(option =>
        option
            .setName('oldname')
            .setDescription('Current name')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('newname')
            .setDescription('New name')
            .setRequired(true)
    ),

    new SlashCommandBuilder()
        .setName('fallenheir')
        .setDescription('Mark an heir as Fallen')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Heir name')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('exileheir')
        .setDescription('Mark an heir as Exiled')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Heir name')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('restoreheir')
        .setDescription('Restore an heir')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Heir name')
                .setRequired(true)
        ),

new SlashCommandBuilder()
    .setName('removeheir')
    .setDescription('Remove an heir from the lineage')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Heir name')
            .setRequired(true)
    )

];

const rest = new REST({
    version: '10'
}).setToken(process.env.TOKEN);

(async () => {
    try {

        console.log('Registering commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                '1515372528607166576',
                '1447026920536670341'
            ),
            {
                body: commands
            }
        );

        console.log('Commands registered.');

    } catch (error) {
        console.error(error);
    }
})();