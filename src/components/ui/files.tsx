import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import Link from "next/link";
import { FolderIcon, FolderOpenIcon, FileIcon, ChevronRight, MoreHorizontal, FilePlus, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type CreatingState = {
  type: "file" | "folder";
  parentId: string | null;
} | null;

type FilesContextValue = {
  creatingState: CreatingState;
  setCreatingState: (state: CreatingState) => void;
  onCreateFile: (name: string, parentId: string | null) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null) => Promise<void>;
  onRenameFolder: (id: string, newName: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onRenameFile: (id: string, newName: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
};

const FilesContext = createContext<FilesContextValue | null>(null);

export function useFilesContext() {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error("useFilesContext must be used within a FilesProvider");
  }
  return context;
}

export type FileProps = {
  name: string;
  href?: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
};

export type FolderProps = {
  name: string;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

export type FolderWithActionsProps = {
  id: string;
  name: string;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

export type FileWithActionsProps = {
  id: string;
  name: string;
  href?: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
};

export const File: React.FC<FileProps> = ({ name, href, className, isSelected, onClick }) => {
  const baseClassName = cn(
    "flex items-center space-x-2 py-1 text-sm hover:bg-muted rounded px-2 cursor-pointer",
    isSelected && "bg-muted",
    className
  );

  const content = (
    <>
      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span>{name}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClassName} onClick={onClick}>
      {content}
    </div>
  );
};

// File with dropdown actions
export const FileWithActions: React.FC<FileWithActionsProps> = ({
  id,
  name,
  href,
  className,
  isSelected,
  onClick,
}) => {
  const { onRenameFile, onDeleteFile } = useFilesContext();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRenaming(true);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleRenameSubmit = async (newName: string) => {
    await onRenameFile(id, newName);
    setIsRenaming(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteFile(id);
    setShowDeleteDialog(false);
  };

  if (isRenaming) {
    return (
      <RenameInput
        initialValue={name}
        onSubmit={handleRenameSubmit}
        onCancel={() => setIsRenaming(false)}
        icon={<FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
        className={className}
      />
    );
  }

  const baseClassName = cn(
    "flex items-center py-1 text-sm hover:bg-muted rounded px-2 cursor-pointer group/file",
    isSelected && "bg-muted",
    className
  );

  const content = (
    <>
      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="ml-2 flex-1">{name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover/file:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="min-w-40">
          <DropdownMenuItem onClick={handleRename}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <>
      {href ? (
        <Link href={href} className={baseClassName} onClick={onClick}>
          {content}
        </Link>
      ) : (
        <div className={baseClassName} onClick={onClick}>
          {content}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export type NewFileInputProps = {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  className?: string;
};

export const NewFileInput: React.FC<NewFileInputProps> = ({ onSubmit, onCancel, className }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 py-1 text-sm bg-muted rounded px-2", className)}>
      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter file name..."
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
};

export type NewFolderInputProps = {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  className?: string;
};

export const NewFolderInput: React.FC<NewFolderInputProps> = ({ onSubmit, onCancel, className }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 py-1 text-sm bg-muted rounded px-2", className)}>
      <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter folder name..."
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
};

// Rename input component
export type RenameInputProps = {
  initialValue: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  className?: string;
};

export const RenameInput: React.FC<RenameInputProps> = ({
  initialValue,
  onSubmit,
  onCancel,
  icon,
  className
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim() && value.trim() !== initialValue) {
      onSubmit(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 py-1 text-sm bg-muted rounded px-2", className)}>
      {icon || <FolderIcon className="h-4 w-4 text-muted-foreground" />}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter name..."
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
};

const FolderTriggerExpandable: React.FC<{
  name: string;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ name, className, isSelected, onSelect, rightSlot }) => (
  <AccordionPrimitive.Header className="flex">
    <div className={cn(
      "flex flex-1 items-center text-sm font-medium transition-all hover:bg-muted rounded group/folder",
      isSelected && "bg-muted",
      className
    )}>
      <AccordionPrimitive.Trigger
        className="flex flex-1 items-center py-1 px-2 hover:no-underline"
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect();
          }
        }}
      >
        <div className="relative flex items-center flex-1">
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/folder:rotate-90 mr-1" />
          <FolderIcon className="h-4 w-4 text-muted-foreground hidden group-data-[state=closed]/folder:block" />
          <FolderOpenIcon className="h-4 w-4 text-muted-foreground group-data-[state=open]/folder:block hidden" />
          <span className="ml-2">{name}</span>
        </div>
      </AccordionPrimitive.Trigger>
      {rightSlot && <div className="pr-2">{rightSlot}</div>}
    </div>
  </AccordionPrimitive.Header>
);

const FolderTriggerEmpty: React.FC<{
  name: string;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ name, className, isSelected, onSelect, rightSlot }) => (
  <div
    className={cn(
      "flex flex-1 items-center py-1 text-sm font-medium hover:bg-muted rounded px-2 cursor-pointer group/folder",
      isSelected && "bg-muted",
      className
    )}
    onClick={onSelect}
  >
    <FolderIcon className="h-4 w-4 text-muted-foreground mr-2" />
    <span className="flex-1">{name}</span>
    {rightSlot}
  </div>
);

const FolderContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <AccordionPrimitive.Content
    className={cn("pl-2 overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", className)}
  >
    <div className="pl-4 border-border">{children}</div>
  </AccordionPrimitive.Content>
);

export const Folder: React.FC<FolderProps> = ({ name, children, className, isSelected, onSelect }) => {
  const hasFiles = React.Children.count(children) > 0;

  return hasFiles ? (
    <AccordionPrimitive.Item value={name} className={className}>
      <FolderTriggerExpandable name={name} isSelected={isSelected} onSelect={onSelect} />
      <FolderContent>{children}</FolderContent>
    </AccordionPrimitive.Item>
  ) : (
    <FolderTriggerEmpty name={name} className={className} isSelected={isSelected} onSelect={onSelect} />
  );
};

// Folder with dropdown actions
export const FolderWithActions: React.FC<FolderWithActionsProps> = ({
  id,
  name,
  children,
  className,
  isSelected,
  onSelect
}) => {
  const {
    creatingState,
    setCreatingState,
    onCreateFile,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
  } = useFilesContext();

  const [isRenaming, setIsRenaming] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if we're creating something inside this folder
  const isCreatingInThisFolder = creatingState?.parentId === id;
  const isCreatingFile = isCreatingInThisFolder && creatingState?.type === "file";
  const isCreatingFolder = isCreatingInThisFolder && creatingState?.type === "folder";

  const handleNewFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Setting creatingState will auto-expand this folder via FilesProvider
    setCreatingState({ type: "file", parentId: id });
  }, [id, setCreatingState]);

  const handleNewFolder = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Setting creatingState will auto-expand this folder via FilesProvider
    setCreatingState({ type: "folder", parentId: id });
  }, [id, setCreatingState]);

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleFileSubmit = async (fileName: string) => {
    await onCreateFile(fileName, id);
    setCreatingState(null);
  };

  const handleFolderSubmit = async (folderName: string) => {
    await onCreateFolder(folderName, id);
    setCreatingState(null);
  };

  const handleRenameSubmit = async (newName: string) => {
    await onRenameFolder(id, newName);
    setIsRenaming(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteFolder(id);
    setShowDeleteDialog(false);
  };

  const handleCancel = () => {
    setCreatingState(null);
  };

  // Count children including creating inputs
  const childCount = React.Children.count(children);
  const hasContent = childCount > 0 || isCreatingFile || isCreatingFolder;

  const dropdownButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover/folder:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="min-w-50">
        <DropdownMenuItem onClick={handleNewFile}>
          <FilePlus className="h-4 w-4 mr-2" />
          New File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNewFolder}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRename}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Render rename mode
  if (isRenaming) {
    return (
      <RenameInput
        initialValue={name}
        onSubmit={handleRenameSubmit}
        onCancel={() => setIsRenaming(false)}
        className={className}
      />
    );
  }

  const nestedContent = (
    <>
      {isCreatingFile && (
        <NewFileInput onSubmit={handleFileSubmit} onCancel={handleCancel} />
      )}
      {isCreatingFolder && (
        <NewFolderInput onSubmit={handleFolderSubmit} onCancel={handleCancel} />
      )}
      {children}
    </>
  );

  return (
    <>
      {hasContent ? (
        <AccordionPrimitive.Item value={id} className={className}>
          <FolderTriggerExpandable
            name={name}
            isSelected={isSelected}
            onSelect={onSelect}
            rightSlot={dropdownButton}
          />
          <FolderContent>{nestedContent}</FolderContent>
        </AccordionPrimitive.Item>
      ) : (
        <FolderTriggerEmpty
          name={name}
          className={className}
          isSelected={isSelected}
          onSelect={onSelect}
          rightSlot={dropdownButton}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{name}&quot;? This action cannot be undone and will delete all files and folders inside.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type FilesProps = {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
};

type FilesProviderProps = {
  children: React.ReactNode;
  className?: string;
  defaultOpenFolders?: string[];
  onCreateFile: (name: string, parentId: string | null) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null) => Promise<void>;
  onRenameFolder: (id: string, newName: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onRenameFile: (id: string, newName: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  creatingState: CreatingState;
  setCreatingState: (state: CreatingState) => void;
};

export const FilesProvider: React.FC<FilesProviderProps> = ({
  children,
  className,
  defaultOpenFolders = [],
  onCreateFile,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  creatingState,
  setCreatingState,
}) => {
  const [openFolders, setOpenFolders] = useState<string[]>(defaultOpenFolders);

  // Auto-expand folder when we start creating inside it
  useEffect(() => {
    if (creatingState?.parentId && !openFolders.includes(creatingState.parentId)) {
      setOpenFolders(prev => [...prev, creatingState.parentId!]);
    }
  }, [creatingState?.parentId, openFolders]);

  return (
    <FilesContext.Provider
      value={{
        creatingState,
        setCreatingState,
        onCreateFile,
        onCreateFolder,
        onRenameFolder,
        onDeleteFolder,
        onRenameFile,
        onDeleteFile,
      }}
    >
      <AccordionPrimitive.Root
        type="multiple"
        className={cn("w-full", className)}
        value={openFolders}
        onValueChange={setOpenFolders}
      >
        {children}
      </AccordionPrimitive.Root>
    </FilesContext.Provider>
  );
};

export const Files: React.FC<FilesProps> = ({ children, defaultValue, className }) => {
  const defaultOpenFolders = defaultValue ? defaultValue.split("/") : undefined;

  return (
    <AccordionPrimitive.Root
      type="multiple"
      className={cn("w-full", className)}
      defaultValue={defaultOpenFolders}
    >
      {children}
    </AccordionPrimitive.Root>
  );
};

export type { CreatingState };
