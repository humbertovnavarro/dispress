import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import client from "../../lib/client";
import { Plugin } from "../../lib/client";
describe("client tests", () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    test("Imports without crashing", () => {
        expect(client).toBeTruthy();
    })
    test("Handles crashing commands", () => {
        client.useCommand({
            body: new SlashCommandBuilder()
            .setName("error")
            .setDescription("throws an error"),
            handler: (interaction: CommandInteraction) => {
                throw new Error();
            }
        })
        const reply = jest.fn();
        const interaction = {
            isCommand: () => true,
            commandName: "error",
            reply,
        } as unknown as CommandInteraction;
        client.emit("interactionCreate", interaction);
        expect(reply).toBeCalledWith("An uknown error occured");
    })
    test("Handles crashing plugins", () => {
        const plugin = {
            name: "bad plugin",
            onReady: jest.fn(() => {
                throw new Error()
            }),
            beforeReady: jest.fn(() => {})
        } as unknown as Plugin;
        client.usePlugin(plugin);
        expect(plugin.beforeReady).toHaveBeenCalledWith(client);
        client.emit("ready", null);
        expect(plugin.onReady).toBeCalledWith(client);

    })
})
