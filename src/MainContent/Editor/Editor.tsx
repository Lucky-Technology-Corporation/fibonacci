import React from 'react';
import MonacoEditor, { EditorDidMount, MonacoEditorProps } from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorAssistant from './EditorAssistant';

interface MiramountState {
  code: string;
  lastPrepend: string;
  setDidDeploy: (didDeploy: boolean) => void;
  caretPosition: { top: number, left: number };
  isAssistantOpen: boolean;
  decorationId: string;
}

interface MiramountProps extends MonacoEditorProps {
  prepend?: string;
  setDidDeploy: (didDeploy: boolean) => void;
}

class Editor extends React.Component<MiramountProps, MiramountState> {
  editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(props: MiramountProps) {
    super(props);
    this.state = {
      code: props.prepend || '',
      lastPrepend: props.prepend || '',
      setDidDeploy: props.setDidDeploy,
      caretPosition: { top: 0, left: 0 },
      isAssistantOpen: false,
      decorationId: '',
    }
    this.onChange = this.onChange.bind(this);
    this.editorDidMount = this.editorDidMount.bind(this);
  }

  componentDidUpdate(prevProps: MiramountProps) {
    if (prevProps.prepend !== this.props.prepend) {
      let newCode = this.state.code;
  
      // Remove the last prepended text if it exists
      if (this.state.lastPrepend && newCode.startsWith(this.state.lastPrepend)) {
        newCode = newCode.substring(this.state.lastPrepend.length);
      }
  
      // Prepend the new text if it's not empty
      if (this.props.prepend) {
        newCode = this.props.prepend + newCode;
      }
  
      // Update both the code and lastPrepend states
      this.setState({ code: newCode, lastPrepend: this.props.prepend || '' });
    }  
  }

  editorDidMount: EditorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    this.editor = editor;
    editor.onDidScrollChange(e => {
      if (e.scrollTopChanged || e.scrollLeftChanged) {
        if(this.state.isAssistantOpen){
          let caretPosition = this.getCaretPosition(editor);
          this.setState({ caretPosition });
        }
      }
    });
    editor.focus();
  }

  getCaretPosition = (editor: monaco.editor.IStandaloneCodeEditor) => {
    let domNode = editor.getDomNode();
    if (!domNode) return { top: 0, left: 0 };

    let cursor = domNode.querySelector('.cursor');
    if (!cursor) return { top: 0, left: 0 };

    let rect = cursor.getBoundingClientRect();
    return { top: rect.top, left: rect.left };
  }

  onChange(newValue: string, e: any) {
    // Reset the didDeploy light state when the code changes
    this.state.setDidDeploy(false)

    // Open the AI assistant if a / is typed on a new line
    if (e.changes[0].text == "/" && e.changes[0].range.endColumn == 1 && e.changes[0].range.startColumn == 1 && this.editor){
      let caretPosition = this.getCaretPosition(this.editor);
      const decoration = {
        range: new monaco.Range(e.changes[0].range.startLineNumber, 1, e.changes[0].range.startLineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'aiDecoration'
        }
      };
      const [decorationId] = this.editor.deltaDecorations([], [decoration]);

      this.setState({ isAssistantOpen: true, caretPosition: caretPosition, decorationId: decorationId});
    }
    
    // Close the AI assistant on delete
    if(this.state.isAssistantOpen && this.editor){
      for (let change of e.changes) {
        const model = this.editor.getModel()
        if (model) {
          let lineContentAfterChange = model.getLineContent(change.range.startLineNumber);
          if (lineContentAfterChange.trim() === '') {
            this.setState({ isAssistantOpen: false });
            this.editor.deltaDecorations([this.state.decorationId], []);
          }
        }
      }
    }

    // Run and close the AI assistant on enter
    if (e.changes[0].text === "\n" && this.state.isAssistantOpen && this.editor) {
      const model = this.editor.getModel();
      if (model) {
        const lineNumber = e.changes[0].range.startLineNumber;
        const maxColumn = model.getLineMaxColumn(lineNumber);
        const oldLineContent = model.getLineContent(lineNumber);

        // This is where you define what you want the new line content to be
        const newLineContent = "Loading...";

        var editOperation = {
          range: new monaco.Range(lineNumber, 1, lineNumber, maxColumn),
          text: newLineContent,
          forceMoveMarkers: true
        };
  
        //Hacky, this waits 100ms before pushing the edit operation to the model to allow the onChange to finish processing
        setTimeout(() => {
          model.pushEditOperations([], [editOperation], () => null);
        }, 100);

        //Send the request to AI which will update the line
        this.requestAI(oldLineContent, lineNumber, model)

        this.setState({ isAssistantOpen: false });
      }
    }

    this.setState({ code: newValue });
  }

  requestAI = async (prompt: string, lineNumber: number, model: monaco.editor.ITextModel) => {

    //Mock request
    setTimeout(() => {
      const newLineContent = "for (let i = 0; i < 10; i++) {\n  console.log(i);\n}";
      var editOperation = {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1000000),
        text: newLineContent,
        forceMoveMarkers: true
      };
      model.pushEditOperations([], [editOperation], () => null);
    }, 500);

    if(this.editor){
      this.editor.deltaDecorations([this.state.decorationId], []);
    }
  }


  render() {
    const options = {
      selectOnLineNumbers: true,
      quickSuggestions: true,
      fontSize: 14
    };

    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new jsonWorker()
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new cssWorker()
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new htmlWorker()
        }
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker()
        }
        return new editorWorker()
      }
    }
    
    // Validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    

    //Add all files to the model
    // monaco.editor.createModel(file1, 'typescript', monaco.Uri.parse(modelUri1));

    // Compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      //For multiple files
      // moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      // module: monaco.languages.typescript.ModuleKind.CommonJS,   
      // alwaysStrict: true,  // Enable strict mode
      // noEmit: true,  // Don't output any .d.ts files
      // typeRoots: ['node_modules/@types'] // Set typeRoots     
    });
    

    monaco.editor.defineTheme('miramount', {
      base: 'vs-dark', 
      inherit: true,
      rules: [], 
      colors: {
        'editor.foreground': '#fffffffd',
        'editor.background': '#191A23',
      }
    });
    
    return (
      <>
      <MonacoEditor
        width="100%"
        height="calc(100% - 44px)"
        language="javascript"
        theme="miramount"
        value={this.state.code}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
        {...this.props} 
      />
      <EditorAssistant isOpen={this.state.isAssistantOpen} caretPosition={this.state.caretPosition} />
      </>
    );
  }
}
export default Editor;
