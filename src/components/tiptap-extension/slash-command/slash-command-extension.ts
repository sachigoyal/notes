import { Extension } from "@tiptap/core"
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion"
import { PluginKey } from "@tiptap/pm/state"
import type { Editor } from "@tiptap/react"
import type { CommandItem } from "./slash-command-list"

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions<CommandItem>, "editor">
}

const slashCommandPluginKey = new PluginKey("slashCommand")

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        pluginKey: slashCommandPluginKey,
        command: ({ editor, range, props }) => {
          console.log("[SlashCommand Extension] Command executed", { range, props })
          props.command({ editor, range })
        },
      } as SlashCommandOptions["suggestion"],
    }
  },

  addProseMirrorPlugins() {
    console.log("[SlashCommand Extension] Adding ProseMirror plugins", this.options.suggestion)
    return [
      Suggestion<CommandItem>({
        editor: this.editor as Editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
