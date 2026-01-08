import { ReactRenderer } from "@tiptap/react"
import tippy, { Instance as TippyInstance } from "tippy.js"
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion"

// Import tippy.js CSS for the popup to render correctly
import "tippy.js/dist/tippy.css"

import {
  SlashCommandList,
  SlashCommandListRef,
  SLASH_COMMANDS,
  CommandItem,
} from "./slash-command-list"

export const slashCommandSuggestion = {
  items: ({ query }: { query: string }): CommandItem[] => {
    const lowercaseQuery = query.toLowerCase()
    
    return SLASH_COMMANDS.filter((item) => {
      // Match by title
      if (item.title.toLowerCase().includes(lowercaseQuery)) {
        return true
      }
      // Match by aliases
      if (item.aliases?.some((alias) => alias.toLowerCase().startsWith(lowercaseQuery))) {
        return true
      }
      return false
    }).slice(0, 10)
  },

  render: () => {
    let component: ReactRenderer<SlashCommandListRef> | null = null
    let popup: TippyInstance[] | null = null

    return {
      onStart: (props: SuggestionProps<CommandItem>) => {
        console.log("[SlashCommand] onStart triggered", props)
        
        component = new ReactRenderer(SlashCommandList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          console.log("[SlashCommand] No clientRect, returning")
          return
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          offset: [0, 8],
          animation: false,
          maxWidth: "none",
        })
      },

      onUpdate(props: SuggestionProps<CommandItem>) {
        component?.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        })
      },

      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide()
          return true
        }

        return component?.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        popup?.[0]?.destroy()
        component?.destroy()
      },
    }
  },
}
