// @ts-strict-ignore
import CardTitle from "@dashboard/components/CardTitle";
import FormSpacer from "@dashboard/components/FormSpacer";
import RichTextEditor from "@dashboard/components/RichTextEditor";
import { RichTextEditorLoading } from "@dashboard/components/RichTextEditor/RichTextEditorLoading";
import {
  PageErrorFragment,
  PageMediaDeleteMutationVariables,
  usePageMediaDeleteMutation,
} from "@dashboard/graphql";
import useNotifier from "@dashboard/hooks/useNotifier";
import { commonMessages, errorMessages } from "@dashboard/intl";
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
  pageMedia: {
    id: string;
    media: Array<{ id: string; url: string }>;
  };
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
  const { data, pageMedia, disabled, errors, onChange, onImageUpload } = props;

  const classes = useStyles(props);
  const intl = useIntl();
  const notify = useNotifier();

  const { defaultValue, editorRef, isReadyForMount, handleChange } =
    useRichTextContext();
  const [deletePageMedia] = usePageMediaDeleteMutation({
    onCompleted: data => {
      const imageError = data.pageMediaDelete.errors.find(
        error =>
          error.field === ("image" as keyof PageMediaDeleteMutationVariables),
      );
      if (imageError) {
        notify({
          status: "error",
          title: intl.formatMessage(errorMessages.imageUploadErrorText),
          text: intl.formatMessage(errorMessages.imageUploadErrorText),
        });
      }
    },
  });

  const formErrors = getFormErrors(["title", "content"], errors);

  if (pageMedia?.media) {
    defaultValue?.blocks.forEach(block => {
      if (block.type === "image") {
        const imageName = block.data.file.url
          .split("?")
          .shift()
          .split("/")
          .pop();
        const pageMediaUrl = pageMedia.media.find(
          media => media.url.split("?").shift().split("/").pop() === imageName,
        );
        if (pageMediaUrl) {
          block.data.file.url = pageMediaUrl.url;
          block.data.file.id = pageMediaUrl.id;
          block.data.file.page_id = pageMedia.id;
        }
      }
    });
  }

  const handleImageDelete = (id: string) =>
    deletePageMedia({ variables: { id } });

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
            onImageDelete={handleImageDelete}
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
