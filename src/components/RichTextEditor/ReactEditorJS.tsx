import { apolloClient } from "@dashboard/graphql/client";
import { pageMediaQuery } from "@dashboard/pages/queries";
import createFileUploadHandler from "@dashboard/utils/handlers/fileUploadHandler";
import EditorJS, { EditorConfig, OutputData, ToolConstructable } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import {
  EditorCore,
  Props as ReactEditorJSProps,
  ReactEditorJS as BaseReactEditorJS,
} from "@react-editor-js/core";
import React from "react";
import { Merge } from "react-hook-form";

import { CustomImageTool as ImageTool } from "./consts";

// Source of @react-editor-js
class ClientEditorCore implements EditorCore {
  private readonly _editorJS: EditorJS;

  constructor(
    { tools, ...config }: EditorConfig,
    upload?: (file: File) => Promise<unknown>,
    deleteFile?: (id: string) => any,
  ) {
    let extendTools = {
      // default tools
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      } as unknown as ToolConstructable,
      ...tools,
    };

    class CustomImageTool extends ImageTool {
      removed() {
        if (deleteFile) {
          // @ts-expect-error
          deleteFile(this._data.file.id)
            .then(() => {
              return {
                success: 1,
                file: null,
              };
            })
            .catch(() => {
              // @ts-expect-error
              return { success: 0, file: { url: this._data.file.url } };
            });
        }
      }
    }

    if (upload) {
      const handleImageUpload = createFileUploadHandler(upload, {});
      const imageTool = {
        image: {
          class: CustomImageTool,
          config: {
            uploader: {
              uploadByFile(file: File) {
                return handleImageUpload(file)
                  .then(resp => {
                    return resp.data.pageMediaCreate.page.id;
                  })
                  .then((id: string) => {
                    return apolloClient.query({
                      fetchPolicy: "network-only",
                      query: pageMediaQuery,
                      variables: {
                        id,
                        size: 0,
                      },
                    });
                  })
                  .then(query => {
                    return {
                      success: 1,
                      file: {
                        url: query.data.page.media.slice(-1)[0].url,
                      },
                    };
                  })
                  .catch(() => {
                    return { success: 0, file: { url: null } };
                  });
              },
            },
          },
          inlineToolbar: true,
        } as unknown as ToolConstructable,
      };
      extendTools = { ...extendTools, ...imageTool };
    }

    this._editorJS = new EditorJS({
      tools: extendTools,
      ...config,
    });
  }

  public async clear() {
    await this._editorJS.clear();
  }

  public async save() {
    return this._editorJS.save();
  }

  public async destroy() {
    try {
      if (this._editorJS) {
        await this._editorJS.isReady;
        this._editorJS.destroy();
      }
    } catch (e) {
      /*
        Dismiss that error.
        Sometimes instance is already unmounted while Editor wants to destroy it.
        Editorjs does this properly so this error does not break anything
       */
    }
  }

  public async render(data: OutputData) {
    await this._editorJS.render(data);
  }
}

export type Props = Merge<
  Omit<ReactEditorJSProps, "factory">,
  Merge<
    { onImageUpload: (file: File) => Promise<unknown> },
    { onImageDelete: (id: string) => any }
  >
>;

function ReactEditorJSClient(props: Props) {
  const { onImageUpload, onImageDelete } = props;
  const factory = React.useCallback((config: EditorConfig) => new ClientEditorCore(config, onImageUpload, onImageDelete), []);

  return <BaseReactEditorJS factory={factory} {...props} />;
}

export const ReactEditorJS = ReactEditorJSClient;
