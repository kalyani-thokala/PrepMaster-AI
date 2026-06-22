import React from "react";
import Editor from "@monaco-editor/react";

const MonacoWrapper = ({
  value,
  onChange,
  language = "javascript",
  height = "400px",
  readOnly = false
}) => {
  const handleEditorChange = (val) => {
    if (onChange) onChange(val);
  };

  // Convert language keys for Monaco Editor mapping
  const getMonacoLanguage = (lang) => {
    const l = lang.toLowerCase();
    if (l === "python" || l === "py") return "python";
    if (l === "javascript" || l === "js") return "javascript";
    if (l === "java") return "java";
    if (l === "cpp" || l === "c++") return "cpp";
    if (l === "c") return "c";
    return "javascript";
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    fontSize: 14,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    minimap: { enabled: false },
    lineNumbers: "on",
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: readOnly,
    theme: "vs-dark",
    automaticLayout: true,
    cursorBlinking: "smooth",
    smoothScrolling: true,
    tabSize: 2,
    wordWrap: "on"
  };

  return (
    <div className="monaco-wrapper border border-darkBorder rounded-xl overflow-hidden shadow-inner">
      <div className="bg-[#0b0f19] px-4 py-2 border-b border-darkBorder flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          Interactive Workspace
        </span>
        <span className="uppercase font-semibold tracking-wider text-primary">
          {getMonacoLanguage(language)}
        </span>
      </div>
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={editorOptions}
        loading={
          <div className="h-full flex flex-col items-center justify-center bg-[#1e293b] text-text text-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            Loading coding workspace...
          </div>
        }
      />
    </div>
  );
};

export default MonacoWrapper;
