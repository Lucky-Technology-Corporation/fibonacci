import GjsEditor, { Canvas } from "@grapesjs/react";
import grapesjs, { Editor as GrapeEditor } from "grapesjs";
import { useCallback } from "react";

export default function GrapesEditor() {
  const onEditor = useCallback((editor: GrapeEditor) => {
    console.log("Grape! Editor loaded", { editor });
    editor.addComponents(`<div>
      <img src="https://path/image" />
      <span title="foo">Hello world!!!</span>
    </div>`);
  }, []);

  return (
    <GjsEditor
      grapesjs={grapesjs}
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      options={{
        height: "100%",
        storageManager: false,
      }}
      plugins={[
        {
          id: "gjs-blocks-basic",
          src: "https://unpkg.com/grapesjs-blocks-basic",
        },
      ]}
      onEditor={onEditor}
    >
      <Canvas />
    </GjsEditor>
  );
}
