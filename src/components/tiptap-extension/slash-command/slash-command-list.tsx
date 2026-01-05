"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react"
import type { Editor } from "@tiptap/react"

// Icons - using available icons from tiptap-icons
import { HeadingOneIcon } from "@/components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "@/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/components/tiptap-icons/heading-three-icon"
import { HeadingFourIcon } from "@/components/tiptap-icons/heading-four-icon"
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon"
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon"
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon"
import { Code2Icon } from "@/components/tiptap-icons/code2-icon"
import { ListIcon } from "@/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon"
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon"
import { BlockquoteIcon } from "@/components/tiptap-icons/blockquote-icon"
import { CodeBlockIcon } from "@/components/tiptap-icons/code-block-icon"
import { BanIcon } from "@/components/tiptap-icons/ban-icon"

import "./slash-command-list.scss"

export interface CommandItem {
    title: string
    description: string
    icon: React.ReactNode
    command: (props: { editor: Editor; range: { from: number; to: number } }) => void
    aliases?: string[]
}

export const SLASH_COMMANDS: CommandItem[] = [
    {
        title: "Heading 1",
        description: "Large section heading",
        icon: <HeadingOneIcon className="slash-command-icon" />,
        aliases: ["h1", "heading1"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run()
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        icon: <HeadingTwoIcon className="slash-command-icon" />,
        aliases: ["h2", "heading2"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run()
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading",
        icon: <HeadingThreeIcon className="slash-command-icon" />,
        aliases: ["h3", "heading3"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run()
        },
    },
    {
        title: "Heading 4",
        description: "Tiny section heading",
        icon: <HeadingFourIcon className="slash-command-icon" />,
        aliases: ["h4", "heading4"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 4 })
                .run()
        },
    },
    {
        title: "Bold",
        description: "Make text bold",
        icon: <BoldIcon className="slash-command-icon" />,
        aliases: ["b", "strong"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setMark("bold")
                .run()
        },
    },
    {
        title: "Italic",
        description: "Make text italic",
        icon: <ItalicIcon className="slash-command-icon" />,
        aliases: ["i", "em", "emphasis"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setMark("italic")
                .run()
        },
    },
    {
        title: "Underline",
        description: "Underline text",
        icon: <UnderlineIcon className="slash-command-icon" />,
        aliases: ["u"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setMark("underline")
                .run()
        },
    },
    {
        title: "Strikethrough",
        description: "Cross out text",
        icon: <StrikeIcon className="slash-command-icon" />,
        aliases: ["s", "strike"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setMark("strike")
                .run()
        },
    },
    {
        title: "Inline Code",
        description: "Inline code snippet",
        icon: <Code2Icon className="slash-command-icon" />,
        aliases: ["code", "c"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setMark("code")
                .run()
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: <ListIcon className="slash-command-icon" />,
        aliases: ["ul", "bullet", "list"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
    },
    {
        title: "Numbered List",
        description: "Create a numbered list",
        icon: <ListOrderedIcon className="slash-command-icon" />,
        aliases: ["ol", "numbered", "ordered"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
    },
    {
        title: "Task List",
        description: "Create a todo list with checkboxes",
        icon: <ListTodoIcon className="slash-command-icon" />,
        aliases: ["todo", "task", "checkbox", "check"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run()
        },
    },
    {
        title: "Quote",
        description: "Add a blockquote",
        icon: <BlockquoteIcon className="slash-command-icon" />,
        aliases: ["blockquote", "q"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run()
        },
    },
    {
        title: "Code Block",
        description: "Add a code block",
        icon: <CodeBlockIcon className="slash-command-icon" />,
        aliases: ["codeblock", "cb", "pre"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
    },
    {
        title: "Divider",
        description: "Add a horizontal line",
        icon: <BanIcon className="slash-command-icon" />,
        aliases: ["hr", "divider", "line", "separator"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        },
    },
]

export interface SlashCommandListProps {
    items: CommandItem[]
    command: (item: CommandItem) => void
    editor: Editor
}

export interface SlashCommandListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashCommandList = forwardRef<
    SlashCommandListRef,
    SlashCommandListProps
>(function SlashCommandList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = items[index]
        if (item) {
            command(item)
        }
    }

    useEffect(() => {
        setSelectedIndex(0)
    }, [items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((prevIndex) =>
                    prevIndex === 0 ? items.length - 1 : prevIndex - 1
                )
                return true
            }

            if (event.key === "ArrowDown") {
                setSelectedIndex((prevIndex) =>
                    prevIndex === items.length - 1 ? 0 : prevIndex + 1
                )
                return true
            }

            if (event.key === "Enter") {
                selectItem(selectedIndex)
                return true
            }

            return false
        },
    }))

    if (items.length === 0) {
        return (
            <div className="slash-command-list">
                <div className="slash-command-empty">No results found</div>
            </div>
        )
    }

    return (
        <div className="slash-command-list">
            {items.map((item, index) => (
                <button
                    key={item.title}
                    className={`slash-command-item ${index === selectedIndex ? "is-selected" : ""
                        }`}
                    onClick={() => selectItem(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <div className="slash-command-item-icon">{item.icon}</div>
                    <div className="slash-command-item-content">
                        <div className="slash-command-item-title">{item.title}</div>
                        <div className="slash-command-item-description">
                            {item.description}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    )
})
