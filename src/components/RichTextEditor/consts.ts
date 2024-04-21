// @ts-strict-ignore
import strikethroughIcon from "@dashboard/icons/StrikethroughIcon";
import { ToolConstructable, ToolSettings } from "@editorjs/editorjs";
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import createGenericInlineTool from "editorjs-inline-tool";

export class CustomImageTool extends ImageTool {
  // eslint-disable-next-line accessor-pairs
  set image(file) {
    // @ts-expect-error
    this._data.file = file || {};

    if (file && file.url) {
      // @ts-expect-error
      this.ui.fillImage(file.url);
      // @ts-expect-error
      this.ui.nodes.imageContainer.querySelector(
        ".image-tool__image-picture",
      ).id = this._data.file.id;
    }
  }
}

const inlineToolbar = ["link", "bold", "italic", "strikethrough"];

export const tools: Record<string, ToolConstructable | ToolSettings> = {
  embed: Embed,
  header: {
    class: Header,
    config: {
      defaultLevel: 1,
      levels: [1, 2, 3],
    },
    inlineToolbar,
  },
  list: {
    class: List,
    inlineToolbar,
  },
  quote: {
    class: Quote,
    inlineToolbar,
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar,
  } as unknown as ToolConstructable,
  strikethrough: createGenericInlineTool({
    sanitize: {
      s: {},
    },
    shortcut: "CMD+S",
    tagName: "s",
    toolboxIcon: strikethroughIcon,
  }),
};
