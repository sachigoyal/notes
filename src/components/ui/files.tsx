import React, { useState, useRef, useEffect } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { FolderIcon, FolderOpenIcon, FileIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FileProps = {
  name: string;
  className?: string;
};

export type FolderProps = {
  name: string;
  children: React.ReactNode;
  className?: string;
};

export const File: React.FC<FileProps> = ({ name, className }) => (
  <div className={cn("flex items-center space-x-2 py-1 text-sm hover:bg-muted rounded px-2 cursor-pointer", className)}>
    <FileIcon className="h-4 w-4 text-muted-foreground" />
    <span>{name}</span>
  </div>
);

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
      <FileIcon className="h-4 w-4 text-muted-foreground" />
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
      <FolderIcon className="h-4 w-4 text-muted-foreground" />
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

const FolderTriggerExpandable: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn("flex flex-1 items-center py-1 text-sm font-medium transition-all hover:no-underline hover:bg-muted rounded px-2 group", className)}
    >
      <div className="relative flex items-center">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90 mr-1" />
        <FolderIcon className="h-4 w-4 text-muted-foreground hidden group-data-[state=closed]:block" />
        <FolderOpenIcon className="h-4 w-4 text-muted-foreground group-data-[state=open]:block hidden" />
        <span className="ml-2">{name}</span>
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const FolderTriggerEmpty: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <div className={cn("flex flex-1 items-center py-1 text-sm font-medium hover:bg-muted rounded px-2", className)}>
    <FolderIcon className="h-4 w-4 text-muted-foreground mr-2" />
    <span>{name}</span>
  </div>
);

const FolderContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <AccordionPrimitive.Content
    className={cn("pl-2 overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", className)}
  >
    <div className="pl-4 border-border">{children}</div>
  </AccordionPrimitive.Content>
);

export const Folder: React.FC<FolderProps> = ({ name, children, className }) => {
  const hasFiles = React.Children.count(children) > 0;

  return hasFiles ? (
    <AccordionPrimitive.Item value={name} className={className}>
      <FolderTriggerExpandable name={name} />
      <FolderContent>{children}</FolderContent>
    </AccordionPrimitive.Item>
  ) : (
    <FolderTriggerEmpty name={name} className={className} />
  );
};

type FilesProps = {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
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
