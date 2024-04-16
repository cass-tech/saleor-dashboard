// @ts-strict-ignore
import CardTitle from "@dashboard/components/CardTitle";
import FormSpacer from "@dashboard/components/FormSpacer";
import RichTextEditor from "@dashboard/components/RichTextEditor";
import { RichTextEditorLoading } from "@dashboard/components/RichTextEditor/RichTextEditorLoading";
import { PageErrorFragment } from "@dashboard/graphql";
import { commonMessages } from "@dashboard/intl";
import { getFormErrors } from "@dashboard/utils/errors";
import getPageErrorMessage from "@dashboard/utils/errors/page";
import { useRichTextContext } from "@dashboard/utils/richText/context";
import { Card, CardContent, TextField } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { useIntl } from "react-intl";

import { PageData } from "../PageDetailsPage/form";

export interface PageInfoProps {
  data: PageData;
  pageMediaUrls: Array<{ url: string }>;
  disabled: boolean;
  errors: PageErrorFragment[];
  onChange: (event: React.ChangeEvent<any>) => void;
  onImageUpload: (file: File) => any;
}

const useStyles = makeStyles(
  {
    root: {
      overflow: "visible",
    },
  },
  { name: "PageInfo" },
);

const PageInfo: React.FC<PageInfoProps> = props => {
  const { data, pageMediaUrls, disabled, errors, onChange, onImageUpload } =
    props;

  const classes = useStyles(props);
  const intl = useIntl();

  const { defaultValue, editorRef, isReadyForMount, handleChange } =
    useRichTextContext();
  const formErrors = getFormErrors(["title", "content"], errors);

  if (pageMediaUrls) {
    defaultValue?.blocks.forEach(block => {
      if (block.type === "image") {
        const imageName = block.data.file.url
          .split("?")
          .shift()
          .split("/")
          .pop();
        const pageMedia = pageMediaUrls.find(
          media => media.url.split("?").shift().split("/").pop() === imageName,
        );
        block.data.file.url = pageMedia ? pageMedia.url : block.data.file.url;
      }
    });
  }

  return (
    <Card className={classes.root}>
      <CardTitle
        title={intl.formatMessage(commonMessages.generalInformations)}
      />
      <CardContent>
        <TextField
          disabled={disabled}
          error={!!formErrors.title}
          fullWidth
          helperText={getPageErrorMessage(formErrors.title, intl)}
          label={intl.formatMessage({
            id: "gr+oXW",
            defaultMessage: "Title",
            description: "page title",
          })}
          name={"title" as keyof PageData}
          value={data.title}
          onChange={onChange}
        />
        <FormSpacer />
        {isReadyForMount ? (
          <RichTextEditor
            defaultValue={defaultValue}
            editorRef={editorRef}
            onChange={handleChange}
            disabled={disabled}
            error={!!formErrors.content}
            helperText={getPageErrorMessage(formErrors.content, intl)}
            label={intl.formatMessage({
              id: "gMwpNC",
              defaultMessage: "Content",
              description: "page content",
            })}
            name={"content" as keyof PageData}
            onImageUpload={onImageUpload}
          />
        ) : (
          <RichTextEditorLoading
            label={intl.formatMessage({
              id: "gMwpNC",
              defaultMessage: "Content",
              description: "page content",
            })}
            name={"content" as keyof PageData}
          />
        )}
      </CardContent>
    </Card>
  );
};
PageInfo.displayName = "PageInfo";
export default PageInfo;
